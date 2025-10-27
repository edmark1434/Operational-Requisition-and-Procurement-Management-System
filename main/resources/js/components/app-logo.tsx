export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                {/* Light mode - show dark icon */}
                <img
                    src="/app-logo-light.svg"
                    alt="App Logo"
                    className="size-12 dark:hidden" // Hidden in dark mode
                />
                {/* Dark mode - show light icon */}
                <img
                    src="/app-logo-dark.svg"
                    alt="App Logo"
                    className="hidden size-12 dark:block" // Hidden in light mode, shown in dark mode
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    BCJ Logistics System
                </span>
            </div>
        </>
    );
}
