from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.common.exceptions import WebDriverException, TimeoutException


def get_firefox_driver(headless=False):
    """
    Initializes and returns a Firefox WebDriver instance with optional headless mode and image blocking.
    
    Args:
        headless (bool): If True, runs Firefox in headless mode. Default is False.
    
    Returns:
        webdriver.Firefox: Configured Firefox WebDriver instance.
    
    Raises:
        WebDriverException: If Firefox driver fails to initialize.
    """
    try:
        options = Options()
        options.headless = headless
        options.binary_location = r"C:\Program Files\Mozilla Firefox\firefox.exe"

        # Block all images to improve performance
        profile = webdriver.FirefoxProfile()
        profile.set_preference("permissions.default.image", 2)
        options.profile = profile

        service = Service(r"C:\geckodriver\geckodriver.exe")

        driver = webdriver.Firefox(service=service, options=options)
        driver.implicitly_wait(10)

        print("Firefox WebDriver initialized successfully.")
        return driver

    except (WebDriverException, TimeoutException) as e:
        print(f"Error initializing Firefox WebDriver: {e}")
        return None
    
def clean_text(text):
    return " ".join(text.split())
