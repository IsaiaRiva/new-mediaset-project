import iene from './IENE SHOW PRIM 22 LE  14_F311678901001401.json' assert { type: 'json' };
import viola from './VIOLA COME IL MARE 2_F311391401000201.json' assert { type: 'json' };
import amici from './AMICI DI MARIA 21 22 DOMENICA POMERIGGIO 16_F311329401001601.json' assert { type: 'json' };
import beautiful from './BEAUTIFUL XXXII _ 8723 BEAUTIFUL XXXII_F311500301008304.json' assert { type: 'json' };
import tg5 from './TG5_27042023.json' assert { type: 'json' };


export const jsonMap = (content) => {
  const FRIENDS = `AMICI DI MARIA '21  '22 DOMENICA POMERIGGIO _ AMICI DI MARIA '21  22 DOMENICA POMERIGGIO 16_F311329401001601` 

const match = () => {
  if(content.includes('AMICI')) { return 'amici'}
  if(content.includes('TG5')) { return 'tg5'}
  if(content.includes('VIOLA')) { return 'viola'}
  if(content.includes('BEAUTIFUL')) { return 'beautiful'}
  if(content.includes('IENE')) { return 'iene'}
  return ' '
}

  const map = {
    'iene' : iene,
    'viola' : viola,
    'amici' : amici, 
    'beautiful' : beautiful,
    'tg5' : tg5
  }
  console.log(`🧊 ~ map[match]: `, map[match()]);
  return map[match()] ?? ''
};
