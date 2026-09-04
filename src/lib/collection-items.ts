const serviceCardImages: Record<string, string> = {
  'generator-installation': '/reviews/images/services/generator-installation.jpg',
  'solar-panel-installation': '/reviews/images/services/solar-panel-installation.jpg',
  'ceiling-fan-installation': '/reviews/images/services/ceiling-fan-installation.jpg',
  'generator-repair': '/reviews/images/services/generator-repair.jpg',
  'whole-house-surge-protector': '/reviews/images/services/whole-house-surge-protector.jpg',
  'gfci-outlet-installation': '/reviews/images/services/gfci-outlet-installation.jpg',
  'garbage-disposal-wiring': '/reviews/images/services/garbage-disposal-wiring.jpg',
  'electrical-repair': '/reviews/images/services/electrical-repair.jpg',
  'electrical-panel-upgrade': '/reviews/images/services/electrical-panel-upgrade.jpg',
  'circuit-breaker-replacement': '/reviews/images/services/circuit-breaker-replacement.jpg',
  'outdoor-lighting-installation': '/reviews/images/services/outdoor-lighting-installation.jpg',
  'tesla-and-ev-charger-installation': '/reviews/images/services/tesla-and-ev-charger-installation.jpg',
  'fire-alarm-installation': '/reviews/images/services/fire-alarm-installation.jpg',
  'electrical-outlet-installation': '/reviews/images/services/electrical-outlet-installation.jpg',
  'recessed-lighting-installation': '/reviews/images/services/recessed-lighting-installation.jpg',
  'electrical-wiring-and-repair-services': '/reviews/images/services/electrical-wiring-and-repair-services.jpg',
  'carbon-monoxide-detector-installation': '/reviews/images/services/carbon-monoxide-detector-installation.jpg',
  'landscape-lighting-installation': '/reviews/images/services/landscape-lighting-installation.jpg',
  'smoke-detector-installation-and-wiring': '/reviews/images/services/smoke-detector-installation-and-wiring.jpg',
  'home-energy-audit': '/reviews/images/services/home-energy-audit.jpg',
  'structured-cabling-installation': '/reviews/images/services/structured-cabling-installation.jpg',
  'solar-battery-installation': '/reviews/images/services/solar-battery-installation.jpg',
  'breaker-box-and-panel-repair': '/reviews/images/services/breaker-box-and-panel-repair.jpg',
  'light-fixture-installation-and-replacement': '/reviews/images/services/light-fixture-installation-and-replacement.jpg',
  'electrical-troubleshooting': '/reviews/images/services/electrical-troubleshooting.jpg',
  'electrical-installation-services': '/reviews/images/services/electrical-installation-services.jpg',
  'low-voltage-wiring-installation': '/reviews/images/services/low-voltage-wiring-installation.jpg',
  'cctv-installation': '/reviews/images/services/cctv-installation.jpg',
  'energy-star-appliances': '/reviews/images/services/energy-star-appliances.jpg',
  'light-switch-replacement-and-installation': '/reviews/images/services/light-switch-replacement-and-installation.jpg',
}

export function serviceCardImageForSlug(serviceSlug: string): string | undefined {
  return serviceCardImages[serviceSlug]
}

