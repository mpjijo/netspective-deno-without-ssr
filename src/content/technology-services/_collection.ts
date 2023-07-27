import * as ac from 'astro:content';
import * as s from '../../governance/information-model/schemas';
import autoRoutes from "./_routes.auto.json";
export type AutoRouteKey = keyof typeof autoRoutes;


export const technologySevicesCollection = ac.defineCollection({ schema: s.consultingSevicesSchema });


export default technologySevicesCollection;