from database import init_db
from dell_scraper import scrape_thread, urls_scrape

def main():
    init_db()

    urls = ["https://www.dell.com/community/en/conversations/xps/xps-13-9360-issues-with-intel-wireless-ac-8265-card/647f8200f4ccf8a8de0b5891",
            "https://www.dell.com/community/en/conversations/xps/laptop-doing-weird-thing-no-idea-what-happened-please-help/68b24aea6b32a07783b3f9cd",
            "https://www.dell.com/community/en/conversations/xps/cmos-battery-replacement-xps-13-plus-9320/680f46a8dded95316fe1bc65",
            "https://www.dell.com/community/en/conversations/xps/heatsink-replacement/682cd5fdb24513769ce2b035",
            "https://www.dell.com/community/en/conversations/xps/xps-17-l702x-main-boards-difference/682ef4b32de562229dd74f05",
            "https://www.dell.com/community/en/conversations/xps/xps-16-9640-infrared-camera-stopped-working-after-recent-update/6833314c9eba2f52122ec8db",
            "https://www.dell.com/community/en/conversations/xps/xps-15-9570-tpm-and-ptt-missing-not-found/684c2e955f0def29c3019ec9",
            "https://www.dell.com/community/en/conversations/xps/max-size-external-ssd-and-type-of-ssd-for-xps-15-l502x-running-latest-w10-home/6852fdb216a3d04bde5b1926",
            "https://www.dell.com/community/en/conversations/xps/dell-xps-9500-wi-fi-connection-randomly-stops-working-even-trying-with-an-external-card-until-reboot/685b235d2578d828a4d24552",
            "https://www.dell.com/community/en/conversations/xps/bios-corruption-detected-auto-recovery-triggered-update-loop/6863fce98f48077d830fef19",
            "https://www.dell.com/community/en/conversations/xps/xps-13-9315-2-in-1-dead-pixels-issues/6878bbe5cb44320200579dcd",
            "https://www.dell.com/community/en/conversations/xps/xps-17-9700-display-cable-fell/6883976c0ec6d03af3a0680d",
            "https://www.dell.com/community/en/conversations/xps/dell-xps-17-9710-persistent-screen-dimming-issue-half-screen-appears-dim/688d088bb185a2077b63f85e",
            "https://www.dell.com/community/en/conversations/xps/dell-xps-15-7590-win11-bricked-my-laptop/689cf4b841e110648f9acf8f",
            "https://www.dell.com/community/en/conversations/xps/9730-bios-xps1797301210-error-unsupported-bios-image/689f25dc0476d1787f4a6632",
            "https://www.dell.com/community/en/conversations/xps/xps-15-7590-killer-ax1650x-160mhz-not-functioning-properly/68a31e9ea417d53e7958eea3",
            "https://www.dell.com/community/en/conversations/xps/how-and-where-to-buy-original-battery-for-xps-17-9700-in-bulgaria/68a4c786a417d53e797ac16f",
            "https://www.dell.com/community/en/conversations/xps/xps-9510-wd19dc-lost-usb-speed/68a831813b8ae53d9b64c17c",
            "https://www.dell.com/community/en/conversations/xps/dell-pen-pn5122w-and-16-in-1-laptop-peripheral-manager-doesnt-have-stylus-icon/68aa02e76b32a077832ca0c6",
            "https://www.dell.com/community/en/conversations/xps/dell-xps-17-9700-hdr-no-longer-turning-on-in-win-11-settings/68ad68aed07569061da7b2bf",
            "https://www.dell.com/community/en/conversations/xps/xps-13-9310-fan-noise/68b1a228c5deda10cc9fa584",
            "https://www.dell.com/community/en/conversations/xps/laptop-doing-weird-thing-no-idea-what-happened-please-help/68b24aea6b32a07783b3f9cd",
            "https://www.dell.com/community/en/conversations/xps/xps-16-9640-dell-nvidia-driver-320156641-a05-causes-height-cpu-usage-for-system-process/67dbe3db563973698f7f5c33",
            "https://www.dell.com/community/en/conversations/xps/xps-9530-official-audio-drivers-simply-dont-work/67dd5029d21b355b0d775e99",
            "https://www.dell.com/community/en/conversations/xps/xps-16-9640-keyboard-insert-key-has-bug/67e21c6a563973698fd33e75",
            "https://www.dell.com/community/en/conversations/xps/dell-xps-9510-detecting-130w-charger-as-only-90w/67ecd093350db56843fb286d",
            "https://www.dell.com/community/en/conversations/xps/boot-fail-stopcode-inaccessible-boot-device-xps-15-9520-after-april-1-2025-firmware-update/67eea9cf563973698f887af0",
            "https://www.dell.com/community/en/conversations/xps/xps-only-charges-when-its-off/67f6be9de5ece54fed9e47fb",
            "https://www.dell.com/community/en/conversations/xps/peculiar-login-issue/67fbb14e0c028d121e7fa5d4",
            "https://www.dell.com/community/en/conversations/xps/will-g-sync-ultimate-work-via-thunderbolt-wd22tb4-dock-using-dp-cable/6801f81469e6265ea7b0cf14",
            "https://www.dell.com/community/en/conversations/xps/xps-16-9640-cant-record-from-line-in/6803724a98eeec0f5d87b623",
            "https://www.dell.com/community/en/conversations/xps/dell-xps-15-7590-laggy-when-power-cable-plugged-in/680c01eec1956c447dc0cc6f"
            ]
    for url in urls:
        print("url:", url)
        scrape_thread(url)

def main_listurl():
    init_db()

    urls = ["https://www.dell.com/community/en/page/accepted-solutions?categoryIds=647a1dbaabcdf40a31989804&topicIds=647a1dc4abcdf40a3198981a"]
    for url in urls:
        print("url:", url)
        urls_scrape(url)

if __name__ == "__main__":
    main()
    # main_listurl()
