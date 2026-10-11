export type Location = 'sf' | 'banff';
export type FilterKey = 'all' | Location;

export interface Photo {
  id: string;
  /** ~100 KB grid thumbnail. */
  thumb: string;
  /** ~0.5 MB tier the lightbox paints first. */
  mid: string;
  /** The full-resolution original, swapped in once decoded. */
  full: string;
  /** Intrinsic size of the thumbnail, so the grid reserves space before it loads. */
  w: number;
  h: number;
  title: string;
  loc: Location;
  city: string;
}

export const PHOTOS: readonly Photo[] = [
  { id: 'ggbridge', thumb: '/photography/thumbs/ggbridge.webp', mid: '/photography/s10/ggbridge.webp', full: '/photography/s10/ggbridge.jpg', w: 900, h: 675, title: 'Golden Gate Bridge', loc: 'sf', city: 'San Francisco' },
  { id: 'alcatraz', thumb: '/photography/thumbs/alcatraz.webp', mid: '/photography/s10/alcatraz.webp', full: '/photography/s10/alcatraz.jpg', w: 900, h: 502, title: 'Alcatraz', loc: 'sf', city: 'San Francisco' },
  { id: 'oakland', thumb: '/photography/thumbs/oaklandfromSF.webp', mid: '/photography/s10/oaklandfromSF.webp', full: '/photography/s10/oaklandfromSF.jpg', w: 900, h: 675, title: 'Oakland, From Across', loc: 'sf', city: 'San Francisco' },
  { id: 'gardens', thumb: '/photography/thumbs/SFgardens.webp', mid: '/photography/s10/SFgardens.webp', full: '/photography/s10/SFgardens.jpg', w: 900, h: 1200, title: 'Botanical Scenery', loc: 'sf', city: 'San Francisco' },
  { id: 'slopes', thumb: '/photography/thumbs/SFslopes.webp', mid: '/photography/s10/SFslopes.webp', full: '/photography/s10/SFslopes.jpg', w: 900, h: 675, title: 'City Slopes', loc: 'sf', city: 'San Francisco' },
  { id: 'nordicstop', thumb: '/photography/thumbs/lakelouisenordicstop.webp', mid: '/photography/s10/lakelouisenordicstop.webp', full: '/photography/s10/lakelouisenordicstop.jpg', w: 900, h: 675, title: 'Lake Louise Nordic Stop', loc: 'banff', city: 'Banff' },
  { id: 'sisters', thumb: '/photography/thumbs/3sisterstrailtrain.webp', mid: '/photography/DSLR/3sisterstrailtrain.webp', full: '/photography/DSLR/3sisterstrailtrain.JPG', w: 900, h: 364, title: 'Three Sisters Trail Train', loc: 'banff', city: 'Banff' },
  { id: 'gondolaeast', thumb: '/photography/thumbs/banffgondolaeast.webp', mid: '/photography/DSLR/banffgondolaeast.webp', full: '/photography/DSLR/banffgondolaeast.JPG', w: 900, h: 599, title: 'Banff Gondola East', loc: 'banff', city: 'Banff' },
  { id: 'gondolasun', thumb: '/photography/thumbs/banffgondolasunisset.webp', mid: '/photography/DSLR/banffgondolasunisset.webp', full: '/photography/DSLR/banffgondolasunisset.JPG', w: 900, h: 599, title: 'Banff Gondola Sunset', loc: 'banff', city: 'Banff' },
  { id: 'fairmont', thumb: '/photography/thumbs/fairmontbanff.webp', mid: '/photography/DSLR/fairmontbanff.webp', full: '/photography/DSLR/fairmontbanff.JPG', w: 900, h: 599, title: 'Fairmont Banff Springs', loc: 'banff', city: 'Banff' },
  { id: 'goldenhour', thumb: '/photography/thumbs/goldenhourmountain.webp', mid: '/photography/DSLR/goldenhourmountain.webp', full: '/photography/DSLR/goldenhourmountain.JPG', w: 900, h: 599, title: 'Golden Hour Mountain', loc: 'banff', city: 'Banff' },
  { id: 'leftmntn', thumb: '/photography/thumbs/leftmntnlakelouise.webp', mid: '/photography/DSLR/leftmntnlakelouise.webp', full: '/photography/DSLR/leftmntnlakelouise.JPG', w: 900, h: 599, title: 'Left Mountain, Lake Louise', loc: 'banff', city: 'Banff' },
  { id: 'ongondola', thumb: '/photography/thumbs/ongondola.webp', mid: '/photography/DSLR/ongondola.webp', full: '/photography/DSLR/ongondola.jpg', w: 900, h: 564, title: 'On Gondola View', loc: 'banff', city: 'Banff' },
];

export interface Filter {
  key: FilterKey;
  label: string;
  tagline: string;
}

export const FILTERS: readonly Filter[] = [
  { key: 'all', label: 'All', tagline: 'Frames collected on the road, fog, summits and golden hours.' },
  { key: 'sf', label: 'San Francisco', tagline: 'Fog rolling over golden steel, shot on foot, uphill both ways.' },
  { key: 'banff', label: 'Banff', tagline: 'Alpine light, glacial water, and one very scenic gondola.' },
];

export const countFor = (key: FilterKey): number => (key === 'all' ? PHOTOS.length : PHOTOS.filter((p) => p.loc === key).length);
export const photosFor = (key: FilterKey): readonly Photo[] => (key === 'all' ? PHOTOS : PHOTOS.filter((p) => p.loc === key));
