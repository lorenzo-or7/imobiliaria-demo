import { useSeo } from '../hooks/useSeo'
import { Featured } from '../sections/Featured'
import { FinalCta } from '../sections/FinalCta'
import { Finder } from '../sections/Finder'
import { Hero } from '../sections/Hero'
import { Journey } from '../sections/Journey'
import { LivingCollections } from '../sections/LivingCollections'
import { Manifesto } from '../sections/Manifesto'
import { Neighborhoods } from '../sections/Neighborhoods'

export default function Home() {
  useSeo('', 'Curadoria de casas e apartamentos escolhidos pela arquitetura, pela luz e pela localização. Busque, compare e agende visitas.')
  return (
    <>
      <Hero />
      <Featured />
      <Finder />
      <LivingCollections />
      <Manifesto />
      <Neighborhoods />
      <Journey />
      <FinalCta />
    </>
  )
}
