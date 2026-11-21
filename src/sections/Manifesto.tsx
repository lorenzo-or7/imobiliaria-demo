import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { PHOTO } from '../data/photos'
import { Img } from '../components/Img'
import { Parallax, TextReveal } from '../components/motion'
import styles from './Manifesto.module.css'

const TEXT =
  'Uma casa certa não se mede só em metros quadrados. Está na luz que entra de manhã, no caminho até o trabalho, no silêncio de um jardim no fim do dia. Escolhemos cada imóvel pela arquitetura, pelo lugar e pela vida que ele permite. O resto é conversa franca, visita marcada e tempo para decidir.'

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.2, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{' '}
    </>
  )
}

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = TEXT.split(' ')

  return (
    <section className={`section ${styles.section}`} aria-labelledby="manifesto-title">
      <div className={`container ${styles.grid}`}>
        <TextReveal id="manifesto-title" lines={['Mais que imóveis.', 'Novas perspectivas.']} className={`display-l ${styles.title}`} />

        <p ref={ref} className={styles.text}>
          {reduce
            ? TEXT
            : words.map((w, i) => <Word key={`${w}-${i}`} word={w} progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 3) / words.length)]} />)}
        </p>

        <div className={styles.images}>
          <Parallax className={styles.imgTall} strength={0.08}>
            <Img src={PHOTO.livingArches} alt="Sala clara com janelas em arco, lareira e vigas de madeira aparente" sizes="(min-width: 1024px) 26vw, 50vw" />
          </Parallax>
          <Parallax className={styles.imgWide} strength={0.04}>
            <Img src={PHOTO.diningStairs} alt="Mesa de jantar escura ao lado de uma escada vazada e de uma divisória de vidro" sizes="(min-width: 1024px) 40vw, 100vw" />
          </Parallax>
          <p className={styles.note}>Imagens de ambientação.</p>
        </div>
      </div>
    </section>
  )
}
