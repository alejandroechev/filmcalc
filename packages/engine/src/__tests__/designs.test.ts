import { describe, it, expect } from 'vitest';
import {
  quarterWaveAR, analyticalQWReflectance,
  highReflectorStack, analyticalHRReflectance,
} from '../designs.js';
import { computeRT } from '../tmm.js';
import { getMaterial } from '../materials.js';

describe('Common Designs (E4)', () => {
  describe('Quarter-wave AR', () => {
    it('MgF2 on BK7: computed R matches analytical at design λ', () => {
      const designLam = 550;
      const nMgF2 = getMaterial('MgF2').nk(designLam).n;
      const nBK7 = getMaterial('BK7').nk(designLam).n;
      const stack = quarterWaveAR('MgF2', 'BK7', designLam, nMgF2);
      const { R: Rtmm } = computeRT(stack, designLam);
      const Rana = analyticalQWReflectance(1.0, nMgF2, nBK7);
      expect(Rtmm).toBeCloseTo(Rana, 3);
    });

    it('reduces reflectance compared to bare substrate', () => {
      const designLam = 550;
      const nMgF2 = getMaterial('MgF2').nk(designLam).n;
      const stack = quarterWaveAR('MgF2', 'BK7', designLam, nMgF2);
      const { R: Rar } = computeRT(stack, designLam);
      const { R: Rbare } = computeRT({ layers: [], substrate: 'BK7' }, designLam);
      expect(Rar).toBeLessThan(Rbare);
    });
  });

  describe('High-reflector stack', () => {
    it('5-pair TiO2/SiO2 HR: R > 99% at design λ', () => {
      const designLam = 550;
      const nH = getMaterial('TiO2').nk(designLam).n;
      const nL = getMaterial('SiO2').nk(designLam).n;
      const stack = highReflectorStack('TiO2', 'SiO2', 'BK7', designLam, nH, nL, 5);
      const { R } = computeRT(stack, designLam);
      expect(R).toBeGreaterThan(0.99);
    });

    it('computed R matches analytical for HR stack', () => {
      const designLam = 550;
      const nH = getMaterial('TiO2').nk(designLam).n;
      const nL = getMaterial('SiO2').nk(designLam).n;
      const nSub = getMaterial('BK7').nk(designLam).n;
      const pairs = 3;
      const stack = highReflectorStack('TiO2', 'SiO2', 'BK7', designLam, nH, nL, pairs);
      const { R: Rtmm } = computeRT(stack, designLam);
      const Rana = analyticalHRReflectance(1.0, nH, nL, nSub, pairs);
      expect(Rtmm).toBeCloseTo(Rana, 2);
    });

    it('more pairs = higher reflectance', () => {
      const designLam = 550;
      const nH = getMaterial('TiO2').nk(designLam).n;
      const nL = getMaterial('SiO2').nk(designLam).n;
      const stack3 = highReflectorStack('TiO2', 'SiO2', 'BK7', designLam, nH, nL, 3);
      const stack5 = highReflectorStack('TiO2', 'SiO2', 'BK7', designLam, nH, nL, 5);
      const { R: R3 } = computeRT(stack3, designLam);
      const { R: R5 } = computeRT(stack5, designLam);
      expect(R5).toBeGreaterThan(R3);
    });
  });
});
