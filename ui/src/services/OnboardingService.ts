import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { ref } from "vue";

export class OnboardingService {
    static isBannerForced = ref(false)

    static forceShowBanner() {
        this.isBannerForced.value = true
        // Automatically reset after a tiny delay so it can be re-triggered
        setTimeout(() => {
            this.isBannerForced.value = false
        }, 100)
    }

    static startVfrTour(onComplete?: () => void) {
        // Inject styles to force visibility of normally hidden elements
        const tourStyle = document.createElement('style');
        tourStyle.id = 'vfr-tour-styles';
        tourStyle.innerHTML = `
            .page0 .tile0 .replaceButton,
            .page0 .tile0 .settingsButton {
                display: inline-flex !important;
            }
        `;
        document.head.appendChild(tourStyle);

        // Delay to allow the banner to hide and DOM to settle
        setTimeout(() => {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                overlayColor: 'rgba(0, 0, 0, 0.75)',
                stagePadding: 4,
                steps: [
                    {
                        element: '.page0',
                        popover: {
                            title: 'Welcome to your custom kneeboard!',
                            description: 'This page is pre-filled with the frequencies and airport information you picked earlier. We can customize this further',
                            side: "bottom",
                            align: 'start'
                        }
                    },
                    {
                        element: '.page0 .tile0 .replaceButton',
                        popover: {
                            title: 'Replace Tile',
                            description: 'Click the replace button to replace the tile with another tile.',
                            side: "bottom",
                            align: 'start'
                        }
                    },
                    {
                        element: '.page0 .tile0 .settingsButton',
                        popover: {
                            title: 'Change Tile Settings',
                            description: 'Most tiles can be customized by clicking the settings button in the top left corner of the tile.',
                            side: "bottom",
                            align: 'start'
                        }
                    },
                    {
                        element: '#btnPrint',
                        popover: {
                            title: 'Ready to fly?',
                            description: 'Click Print to generate your physical kneeboard or export to PDF.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#btnSave',
                        popover: {
                            title: 'Like your creation?',
                            description: 'Click the save button to save a version of this kneeboard and access it across devices.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        popover: {
                            title: 'You\'re All Set!',
                            description: 'Fly safe and enjoy your custom kneeboard!',
                        }
                    }
                ],
                onDestroyed: () => {
                    const style = document.getElementById('vfr-tour-styles');
                    if (style) style.remove();
                    if (onComplete) onComplete();
                }
            });

            driverObj.drive();
        }, 500);
    }
}
