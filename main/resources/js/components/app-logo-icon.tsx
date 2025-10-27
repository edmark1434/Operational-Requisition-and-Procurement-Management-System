import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img
            src="/app-logo-light.svg"
            alt="App Logo"
            className="size-12"
        />
    );
}
