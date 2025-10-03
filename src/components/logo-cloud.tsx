import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function LogoCloud() {
    return (
        <section className="bg-background overflow-hidden py-16 border-t">
            <div className="max-w-7xl mx-auto px-6 space-y-10">
                {/* Header Text */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Trusted by leading financial institutions
                    </p>
                </div>

                {/* Logo Slider */}
                <div className="relative w-full">
                    <InfiniteSlider
                        speedOnHover={20}
                        speed={40}
                        gap={112}>
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-muted-foreground/60 whitespace-nowrap">Egg</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-2xl font-semibold text-muted-foreground/60 whitespace-nowrap">Happy Money</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-muted-foreground/60 whitespace-nowrap">SoFi</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-muted-foreground/60 tracking-wider whitespace-nowrap">OCTANE</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-2xl font-semibold text-muted-foreground/60 whitespace-nowrap">chime</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-3xl font-bold text-muted-foreground/60 whitespace-nowrap">VISA</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-2xl font-semibold text-muted-foreground/60 whitespace-nowrap">Cherry</span>
                        </div>

                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-muted-foreground/60 tracking-tight whitespace-nowrap">INTUIT</span>
                        </div>
                    </InfiniteSlider>

                    <ProgressiveBlur
                        className="pointer-events-none absolute left-0 top-0 h-full w-20"
                        direction="left"
                        blurIntensity={1}
                    />
                    <ProgressiveBlur
                        className="pointer-events-none absolute right-0 top-0 h-full w-20"
                        direction="right"
                        blurIntensity={1}
                    />
                </div>
            </div>
        </section>
    )
}
