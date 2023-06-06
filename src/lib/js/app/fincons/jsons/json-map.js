import ieneAmazon from './amazon/IENE SHOW PRIM 22 LE  14_F311678901001401.json' assert { type: 'json' };
import violaAmazon from './amazon/VIOLA COME IL MARE 2_F311391401000201.json' assert { type: 'json' };
import amiciAmazon from './amazon/AMICI DI MARIA 21 22 DOMENICA POMERIGGIO 16_F311329401001601.json' assert { type: 'json' };
import beautifulAmazon from './amazon/BEAUTIFUL XXXII _ 8723 BEAUTIFUL XXXII_F311500301008304.json' assert { type: 'json' };
import tg5Amazon from './amazon/TG5_27042023.json' assert { type: 'json' };
import ieneCTS from './cts/IENE_SHOW_LE_22_PRIMAVERA___IE_514202314192734993-scene_segmentation_point.json' assert { type: 'json' };
import violaCTS from './cts/VIOLA_COME_IL_MARE___VIOLA_COM_5142023143020733418-scene_segmentation_point.json' assert { type: 'json' };
import amiciCTS from './cts/AMICI_DI_MARIA_21_22_DOMENICA__5142023143019330351-scene_segmentation_point.json' assert { type: 'json' };
import beautifulCTS from './cts/BEAUTIFUL_XXXII___8723_BEAUTIF_5142023143019403939-scene_segmentation_point.json' assert { type: 'json' };
import tg5CTS from './cts/TG5_27042023_5142023143020431915-scene_segmentation_point.json' assert { type: 'json' };


export const jsonMap = (content, client = 'Amazon') => {

const match = () => {
  if(content.includes('AMICI')) { return `amici${client}`}
  if(content.includes('TG5')) { return `tg5${client}`}
  if(content.includes('VIOLA')) { return `viola${client}`}
  if(content.includes('BEAUTIFUL')) { return `beautiful${client}`}
  if(content.includes('IENE')) { return `iene${client}`}
  return ' '
}

  const map = {
    'ieneAmazon' : ieneAmazon,
    'violaAmazon' : violaAmazon,
    'amiciAmazon' : amiciAmazon, 
    'beautifulAmazon' : beautifulAmazon,
    'tg5Amazon' : tg5Amazon,
    'ieneCTS' : ieneCTS,
    'violaCTS' : violaCTS,
    'amiciCTS' : amiciCTS, 
    'beautifulCTS' : beautifulCTS,
    'tg5CTS' : tg5CTS
  }
  console.log(`🧊 ~ map[match]: `, map[match()]);
  return map[match()] ?? ''
};
