// Snapshot of the owner's Google Sheet, read 18 September 2026.
// Visibility dates come from Ward dates; titles/descriptions come from Periods.
export const TIMELINE_SOURCE='https://docs.google.com/spreadsheets/d/107LEc_YgAiATltfdQCZUXCjegXZBKlWfY2cmn6vOl44/edit';
export const PERIODS=Object.freeze([
 [1829,'Opening','Cheshire Lunatic Asylum opens August 1829'],
 [1849,'New wings','Addition of a short west wing to house a chapel on the upper floor, alongside new north and south wings to accommodate 80 additional patients.'],
 [1856,'Chapel','A free-standing, Early English style chapel to the west of the original block.'],
 [1860,'Upton Lea','Two detached ward blocks featuring Gothic detailing to the west of the site.'],
 [1870,'Redesmere/Saughall/Barton','Two two-storey east wings containing patient day rooms.'],
 [1896,'Major building often known as "The Main"','Five new ward blocks to accommodate 404 male patients, administration blocks, and attendant housing.'],
 [1912,'Kelsall/Churton Ward','A dedicated block for epileptic patients, designed by county architect Harry Beswick. Later renamed Churton Ward and now known as Seren Lodge'],
 [1915,'The Annexe','A 440-bed infirmary annexe at the north end of the site.'],
 [1916,'Isolation hospital','Located at the south end of the grounds'],
 [1938,'Nurses home',''],
 [2010,'Upton Dene Phase1','Upton Grange, Ross Avenue, Caldecott Close, Warren Lane'],
 [2016,'Upton Dene Phase2','Lockwood View, Care Home'],
 [2021,'Upton Dene Phase3','Gerrard Crescent, Frost Drive, Sydney Close']
].map(([year,title,description])=>Object.freeze({year,title,description})));

export const WARD_DATES=Object.freeze([
 ['1829',1829,null],['Valley drive',1829,null],['Parsons lane',1829,null],
 ['Vivienne Smith lane',1829,null],['The Willows',1829,null],['1829 Wings',1849,null],
 ['Church',1856,null],['Upton Lea',1860,null],['Redesmere',1870,null],
 ['The Main',1896,2005],['Kelsall',1912,null],['Annexe',1915,2009],
 ['Upton Dene Phase 1',2010,null],['Warren Lane',2010,null],['Upton Grange',2010,null],
 ['Upton Dene Phase 2',2016,null],['Ross Avenue',2016,null],['Lockwood View',2016,null],
 ['Upton Dene Phase 3',2021,null],['Gerrard Crescent',2021,null],['Frost Drive',2021,null],['Sydney Close',2021,null]
].map(([section,built,demolished])=>Object.freeze({section,built,demolished})));
export const SECTION_DATES=Object.freeze(Object.fromEntries(WARD_DATES.map(row=>[row.section,row])));
export const DEFAULT_PERIOD=1916;

// Extra rules are explicit modelling assumptions, not extra rows in the sheet.
// Water tower opens in 1829 per the owner's correction; undated service buildings follow The Main. Context
// planting is retained at every stop. See Research/timeline.md for the audit.
export const EXTRA_DATES=Object.freeze({
 '1829 east end wall':{built:1829,demolished:1849},
 'Water tower':{built:1829,demolished:null},
 'Modern site context':{built:2010,demolished:null},
 'Earlier planting':{built:1829,demolished:2010},
 'Surviving lamp posts':{built:1915,demolished:null},
 'Site context':{built:1829,demolished:null}
});
export function sectionDates(section){
 const dates=SECTION_DATES[section]??EXTRA_DATES[section];
 if(!dates)throw new Error('Unmapped timeline section: '+section);
 return dates;
}
export function existsInYear(section,year){
 const {built,demolished}=sectionDates(section);
 return year>=built&&(demolished==null||year<demolished);
}
export function periodForYear(year){return PERIODS.find(period=>period.year===Number(year))??PERIODS.find(period=>period.year===DEFAULT_PERIOD);}
export function roadSection(name){
 if(/^Parsons Lane/i.test(name))return 'Parsons lane';
 if(/^Upton grange/i.test(name))return 'Upton Grange';
 if(/^Ross Avenue/i.test(name))return 'Ross Avenue';
 return ({'Vivienne Smith Lane':'Vivienne Smith lane','Valley drive':'Valley drive','Warren Lane':'Warren Lane','Lockwood View':'Lockwood View','Gerrard Crescent':'Gerrard Crescent','Frost drive':'Frost Drive','Caldecott Close':'Upton Dene Phase 1'})[name]??null;
}

export const BUILDING_SECTIONS=Object.freeze({
 '1829-centre':'1829','1829-west':'1829','1829-east':'1829',barmere:'Redesmere',redesmere:'Redesmere',
 upton:'Upton Lea',church:'Church',churton:'Kelsall',willows:'The Willows',
 tower:'Water tower',annexe:'Annexe','picton-carden':'Annexe','tarvin-jarman':'Annexe','leighton-newton':'Annexe',oakmere:'Annexe','larkton-jodrell':'Annexe',
 farndon:'The Main',witby:'The Main','irby-ashley':'The Main','hale-daresbury':'The Main','huxley-dunham':'The Main','grafton-edge':'The Main',
 laundry:'The Main',garages:'The Main',mortuary:'The Main',greenhouses:'The Main',estates:'The Main',stores:'The Main','main-admin':'The Main','main-kitchen':'The Main','tower-buildings':'The Main','admin-corridor':'The Main','estate-chimney':'The Main',outhouse:'1829'
});

export function locationSection(view=''){
 if(BUILDING_SECTIONS[view])return BUILDING_SECTIONS[view];
 if(/^(acton|grindley|front|central|entrance)/.test(view))return '1829';
 if(/^(hampton|ince|west)/.test(view))return '1829 Wings';
 if(/^(barton|caldy|ebnal|east-forward-end)/.test(view))return '1829 Wings';
 if(/^(inner-east|inner-court|rear-court|central-court|west-court)/.test(view))return '1829';
 if(/^(saughall|east|redesmere|barmere)/.test(view))return 'Redesmere';
 if(/^(annexe|new-hospital|admin-annexe)/.test(view))return 'Annexe';
 if(/^church/.test(view))return 'Church';
 if(/^churton/.test(view))return 'Kelsall';
 if(/^upton/.test(view))return 'Upton Lea';
 if(/^willows/.test(view))return 'The Willows';
 if(/^outhouse/.test(view))return '1829';
 if(/^tower-[1-4]$|^tower-photo|^tower-plan/.test(view))return 'Water tower';
 if(/^(main-|irby|farndon|witby|grafton|hale|huxley|estates|stores|pharmacy|tower-|ward-corridors|laundry|garages|mortuary|greenhouses|historic-admin)/.test(view))return 'The Main';
 return null;
}

export function periodNote(year){
 if(year===1916)return 'The isolation hospital is not yet modelled.';
 if(year===1938)return 'The nurses’ home is not yet modelled.';
 if(year===2010)return 'Roads are shown; housing is not yet modelled. Ross Avenue appears from 2016, following Ward dates.';
 if(year===2016)return 'Roads are shown; housing and the care home are not yet modelled.';
 if(year===2021)return 'Roads are shown; housing and Sydney Close are not yet modelled.';
 return '';
}
