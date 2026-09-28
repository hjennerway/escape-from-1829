import ashSmall from './ash_small.mjs';
import ashMedium from './ash_medium.mjs';
import ashLarge from './ash_large.mjs';
import aspenSmall from './aspen_small.mjs';
import aspenMedium from './aspen_medium.mjs';
import aspenLarge from './aspen_large.mjs';
import bush1 from './bush_1.mjs';
import bush2 from './bush_2.mjs';
import bush3 from './bush_3.mjs';
import oakSmall from './oak_small.mjs';
import oakMedium from './oak_medium.mjs';
import oakLarge from './oak_large.mjs';
import pineSmall from './pine_small.mjs';
import pineMedium from './pine_medium.mjs';
import pineLarge from './pine_large.mjs';
import trellis from './trellis.mjs';
import TreeOptions from '../options.mjs';

export const TreePreset = {
  'Ash Small': ashSmall,
  'Ash Medium': ashMedium,
  'Ash Large': ashLarge,
  'Aspen Small': aspenSmall,
  'Aspen Medium': aspenMedium,
  'Aspen Large': aspenLarge,
  'Bush 1': bush1,
  'Bush 2': bush2,
  'Bush 3': bush3,
  'Oak Small': oakSmall,
  'Oak Medium': oakMedium,
  'Oak Large': oakLarge,
  'Pine Small': pineSmall,
  'Pine Medium': pineMedium,
  'Pine Large': pineLarge,
  'Trellis': trellis,
};

/**
 * @param {string} name The name of the preset to load
 * @returns {TreeOptions}
 */
export function loadPreset(name) {
  const preset = TreePreset[name];
  return preset ? structuredClone(preset) : new TreeOptions();
}