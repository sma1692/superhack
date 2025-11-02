from selenium.webdriver.common.by import By
from utils import get_firefox_driver, clean_text
from models import Question, Answer, ThreadURL
from datetime import datetime
import uuid, time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from utils import get_firefox_driver
from models import ThreadURL
import time


def urls_scrape(url):
    driver = get_firefox_driver()
    driver.get(url)
    time.sleep(5)

    # --- Accept cookie banner if present ---
    try:
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
        ).click()
        print("✅ Clicked on 'Accept All'")
    except Exception:
        print("⚪ Cookie banner not found or already accepted.")

    urls_data = set()  # to avoid duplicates in this session

    while True:
        # --- Find all conversation links currently visible ---
        try:
            conversation_list_parent = driver.find_element(By.CLASS_NAME, "conversation_list__conversations")
            sections = conversation_list_parent.find_elements(By.XPATH, ".//section[contains(@class, 'dell-conversation-card')]")
        except Exception as e:
            print("❌ Error finding conversation list:", e)
            break

        print(f"\n📋 Currently visible sections: {len(sections)}")

        new_items = 0
        for section in sections:
            try:
                a_tag = section.find_element(By.XPATH, ".//a[@title and @href]")
                href = a_tag.get_attribute("href")
                title = a_tag.get_attribute("title").strip()

                if href and title and href not in urls_data:
                    urls_data.add(href)

                    # Check in MongoDB before saving (avoid duplicates)
                    if not ThreadURL.objects(href=href):
                        ThreadURL(title=title, href=href).save()
                        new_items += 1
                        print(f"🟢 Saved new: {title}")
                    else:
                        print(f"⚪ Already in DB: {href}")
            except Exception:
                continue

        print(f"✅ {new_items} new records saved to DB in this batch")

        # --- Try clicking "Load More" ---
        try:
            load_more_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Load More')]"))
            )
            driver.execute_script("arguments[0].scrollIntoView(true);", load_more_button)
            time.sleep(1)
            load_more_button.click()
            print("🔄 Clicked 'Load More' to fetch next batch...")
            time.sleep(5)  # wait for new content
        except Exception:
            print("✅ No more 'Load More' button found — scraping complete.")
            break

    driver.quit()
    print(f"\n🏁 Done! Total unique records processed: {len(urls_data)}")
    return list(urls_data)


def urls_scrape1(url):
    driver = get_firefox_driver()
    driver.get(url)
    time.sleep(5)

    # --- Accept cookie banner if present ---
    try:
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
        ).click()
        print("✅ Clicked on 'Accept All'")
    except Exception as e:
        print("❌ Cookie banner not found or already accepted:", e)

    # --- Find all conversation sections ---
    conversation_list_parent = driver.find_element(By.CLASS_NAME, "conversation_list__conversations")
    sections = conversation_list_parent.find_elements(By.XPATH, ".//section[contains(@class, 'dell-conversation-card')]")
    print("Total sections:", len(sections))

    # --- Collect all URLs in a list ---
    urls_data = []

    for index, section in enumerate(sections, start=1):
        try:
            a_tag = section.find_element(By.XPATH, ".//a[@title and @href]")
            href = a_tag.get_attribute("href")
            title = a_tag.get_attribute("title").strip()

            if href and title:
                urls_data.append({"title": title, "href": href})
                print(f"[{index}] {title} → {href}")

        except Exception as e:
            print(f"❌ Skipping section {index} — link not found:", e)

    print(f"\n✅ Total valid links collected: {len(urls_data)}")

    # --- Store all URLs into MongoDB after collecting ---
    for data in urls_data:
        try:
            # Avoid duplicate entries
            if not ThreadURL.objects(href=data["href"]):
                ThreadURL(title=data["title"], href=data["href"]).save()
                print(f"🟢 Saved: {data['title']}")
            else:
                print(f"⚪ Skipped duplicate: {data['href']}")
        except Exception as e:
            print(f"❌ Error saving {data['href']}: {e}")

    driver.quit()
    return urls_data



def scrape_thread(url):
    driver = get_firefox_driver()
    driver.get(url)
    time.sleep(5)

    question_id = str(uuid.uuid4())
    print("\nquestion_id:", question_id)
    print(f"Scraping: {url}")

    try:
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
        ).click()
        print("✅ Clicked on 'Accept All'")
    except Exception as e:
        print("❌ Cookie banner not found or already accepted:", e)

    question_parent = driver.find_element(By.CLASS_NAME, "conversation-balloon-dell__content-cnt")

    question_user_detail_parent = question_parent.find_element(By.CLASS_NAME, "dell-conversation-balloon__header__container")
    question_author = clean_text(question_user_detail_parent.find_element(By.CLASS_NAME, "balloon__user-link-cnt").text)
    print("question_author:", question_author)

    question_view = clean_text(question_parent.find_element(By.CLASS_NAME, "dell-conversation-balloon__view-count-cnt").text)
    print("question_view:", question_view)

    question_like_count = clean_text(question_parent.find_element(By.CLASS_NAME, "dell-conversation-balloon__like-count-cnt").text)
    print("question_like_count:", question_like_count)

    question_datetime = clean_text(question_parent.find_element(By.CLASS_NAME, "dell-conversation-ballon__header-date").text)
    print("question_datetime:", question_datetime)

    question_name = clean_text(question_parent.find_element(By.CLASS_NAME, "conversation-balloon__content__title").text)
    print("question_name:", question_name)

    question_desc = clean_text(question_parent.find_element(By.CLASS_NAME, "conversation-balloon__content__text").text)
    print("question_desc:", len(question_desc))

    # Create question object
    question = Question(
        question_id=question_id,
        title=question_name,
        description=question_desc,
        author=question_author,
        view_count=question_view,
        like_count=question_like_count,
        posted_date=question_datetime,
        url=url,
    )
    question.save()
    print(f"***** Saved question: {question_name}")


    answer_parent = driver.find_element(By.CLASS_NAME, "dell-conversation-responses-entity-widget")
    answer_list_parent = answer_parent.find_elements(By.CLASS_NAME, "comment-list__comment")
    print("Total answers:", len(answer_list_parent))

    for index, ans in enumerate(answer_list_parent):
        print(f"\n--- Answer {index + 1} of question {question_id} ---")
        answer_id = str(uuid.uuid4())
        
        ans_classes = ans.get_attribute("class")        
        if "comment-is-accepted" in ans_classes:
            answer_community_accepted = True
        else:
            answer_community_accepted = False
        print("answer_community_accepted:", answer_community_accepted)
    
        answer_author_detail_parent = ans.find_element(By.CLASS_NAME, "dell-comment-balloon__header__container")

        answer_username = clean_text(answer_author_detail_parent.find_element(By.CLASS_NAME, "balloon__user-link-cnt").text)
        print("answer_username:", answer_username)

        answer_like_count = clean_text(answer_author_detail_parent.find_element(By.CLASS_NAME, "dell-comment-balloon__like-count-cnt").text)
        print("answer_like_count:", answer_like_count)

        answer_datetime = clean_text(answer_author_detail_parent.find_element(By.CLASS_NAME, "dell-comment-ballon__header-date").text)
        print("answer_datetime:", answer_datetime)

        answer_desc = clean_text(ans.find_element(By.CLASS_NAME, "dell-comment-balloon__content__text").text)
        print("answer_desc:", len(answer_desc))


        answer = Answer(
            answer_id=answer_id,
            question_id=question_id,
            author=answer_username,
            content=answer_desc,
            posted_date=answer_datetime,
            like_count=answer_like_count,
            is_accepted=answer_community_accepted,
        )
        answer.save()

        # # Link this answer to the question
        # question.update(push__answers=answer)
        # print(f"********** Saved answer by {answer_username} (Accepted: {answer_community_accepted})")


    driver.quit()
