export type Card = {
  id: number
  img: string
  name: string
  quote: string
  socials: string[]
}

export const baseCards: Card[] = [
  { id: 1, img: 'https://cdnlv.redkassa.ru/live/sitenew/picture/09b6b3f4-ac45-4a13-9dbe-eabae106cae2', name: 'Macan', quote: 'Пока не упал духом, любые другие падения по плечу', socials: ['Узнать больше'] },
  { id: 2, img: 'https://i.scdn.co/image/ab6761610000e5eb038e6fce74892686d0b621f6', name: '1 kla$', quote: 'Я протыкаю дев, как пирсинг, Банально, baby, я женоненавистник!', socials: ['Узнать больше'] },
  { id: 3, img: 'https://avatars.mds.yandex.net/i?id=1a579376724046ba8c4fff02ee23d73b_l-12590692-images-thumbs&n=13', name: 'Icegergert', quote: 'Yung Rich, Yung Hustle, Secret Victory', socials: ['Узнать больше'] },
  { id: 4, img: 'https://lastfm.freetls.fastly.net/i/u/ar0/25cebcf73b9daeb788c9dbe2dafbd8c0.jpg', name: 'Tenderlybae', quote: 'Дважды, однажды, теперь уже не важно', socials: ['Узнать больше'] },
  { id: 5, img: 'https://i.pinimg.com/736x/db/fd/30/dbfd3008248fa7f133395b3e8a4faa6b.jpg', name: 'Мэйби Бэйби', quote: 'Френдзона Френдзона Френдзона Френдзона', socials: ['Узнать больше'] },
]
