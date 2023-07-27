import aboutusSevicesCollection from "./about-us/_collection";
import consultingSevicesCollection from "./consulting-services/_collection";
import technologySevicesCollection from "./technology-services/_collection";
import thoughtleadershipSevicesCollection from "./thought-leadership/_collection";
import solutionsSevicesCollection from "./solutions/_collection";
/**
 * We define collections outside of config.ts so that they can easily be removed
 * during development or need to be pulled into different Astro projects.
 */

// Astro looks for an exported `collections` instance to register collections.
// Each key of the collections object is top-level src/content/* directory.
export const collections = {
  'consulting-services': consultingSevicesCollection,
  'about-us': aboutusSevicesCollection,
  'technology-services': technologySevicesCollection,
  'thought-leadership': thoughtleadershipSevicesCollection,
  'solutions': solutionsSevicesCollection
} as const;

export type ContentCollection = keyof typeof collections;
