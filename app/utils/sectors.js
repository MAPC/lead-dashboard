import capitalize from './capitalize';

const sectors = [
  'residential',
  'commercial',
  'industrial',
];

export const sectorRouteMap = sectors.map(sector => {
  return {
    name: capitalize(sector), 
    route: `city.${sector}`
  };
});

export default sectors;
