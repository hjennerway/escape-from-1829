// Fictional gameplay uses, chosen by size and position, not historical claims.
export const ROOM_USES={
 0:{R1:'hydrotherapy',R2:'ward',R3:'nursing',R4:'dayroom',R5:'privy',R6:'surgery',R7:'dispensary',R8:'ect',R9:'consultation',R10:'records',R11:'nursing',R12:'showerTreatment',R13:'ward',R14:'nursing',R15:'dayroom',R16:'privy',R17:'store',R18:'bookroom',R19:'reading',R20:'dining',R21:'bookroom',R22:'activity',R23:'admissions',R24:'stairs',R25:'consultation',R26:'office',R27:'dayroom',R28:'dining',R29:'electricalTreatment',R30:'staff',R31:'bookroom',R32:'ward',R33:'privy',R34:'reading',R35:'privy',R36:'ward',R37:'bookroom',R38:'reading',R39:'store',R40:'porch'},
 1:{R1:'bedroom',R2:'ward',R3:'bedroom',R4:'dayroom',R5:'privy',R6:'centralDormitory',R8:'centralDormitory',R10:'centralDormitory',R12:'bedroom',R13:'ward',R14:'bedroom',R15:'dayroom',R16:'privy',R17:'store',R18:'bookroom',R19:'bedroom',R20:'ward',R21:'bookroom',R22:'ward',R23:'nursing',R24:'stairs',R25:'nursing',R26:'staff',R27:'ward',R28:'bedroom',R29:'bedroom',R30:'staffBedroom',R31:'bookroom',R32:'ward',R33:'privy',R34:'bookroom',R35:'privy',R36:'ward',R37:'reading'},
 2:{B1:'store',B2:'linen',B3:'workshop',B4:'records',B5:'paddedCell',B6:'paddedCell',B7:'paddedCell',B8:'paddedCell',B9:'circulation',B10:'workshop',B11:'store',B12:'records'},
 3:{R41:'recordsOffice',R42:'office',R43:'staff',R44:'archive',R45:'linen',R46:'library',R47:'staff',R48:'reading',R49:'office',R50:'archive',R51:'junctionStairs'}
};
ROOM_USES[1].R51='junctionStairs';
ROOM_USES[1].R19='sewing';
export const ROOM_PURPOSES={
 paddedCell:{name:'Padded cell · patient confinement',fixed:['cellMattress'],variable:[]},
 privy:{name:'Shared privies and washroom',fixed:[],variable:[]},
 hydrotherapy:{name:'Hydrotherapy room',fixed:['hydroBath','cupboard','chair'],variable:['chair']},
 showerTreatment:{name:'Cold-water treatment room',fixed:['hydroShower','cupboard','chair'],variable:['chair']},
 surgery:{name:'Surgical treatment room',fixed:['operatingTable','cupboard','table','chair'],variable:['chair']},
 dispensary:{name:'Apothecary and medicine room',fixed:['apothecary','table','bloodletting','cupboard'],variable:['chair']},
 ect:{name:'ECT treatment room · later hospital era',fixed:['ectMachine','bed','cupboard','chair'],variable:['chair']},
 electricalTreatment:{name:'Early electrical treatment room',fixed:['electrotherapy','cupboard','table','chair'],variable:['chair']},
 treatment:{name:'Treatment room',fixed:['bed','cupboard','table','chair'],variable:['chair','books']},
 consultation:{name:'Consultation room',fixed:['table','chair','cupboard'],variable:['chair','books']},
 medicine:{name:'Medicine store',fixed:['cupboard','cupboard','table'],variable:['chair','books']},
 nursing:{name:'Nursing station',fixed:['table','chair','cupboard'],variable:['books','chair']},
 ward:{name:'Dormitory ward',fixed:['bed','bed','bed','bed','cupboard','cupboard','bench'],variable:['chair','bench']},
 centralDormitory:{name:'Central dormitory · 14 beds',fixed:[...Array(14).fill('bed'),'cupboard','cupboard','bench','bench'],variable:['bench','books']},
 bedroom:{name:'Patient bedroom',fixed:['bed','cupboard','chair','bench'],variable:['books','chair']},
 staffBedroom:{name:'Staff bedroom',fixed:['bed','cupboard','table','bench'],variable:['chair','books']},
 dayroom:{name:'Ward day room',fixed:['table','chair','chair','bookcase'],variable:['chair','books']},
 quiet:{name:'Quiet sitting room',fixed:['chair','chair','table'],variable:['books','chair']},
 bookroom:{name:'Small library',fixed:Array(12).fill('bookcase'),variable:[]},
 library:{name:'Library',fixed:[...Array(16).fill('bookcase'),'table','table','chair','chair','chair','chair'],variable:['books','chair']},
 reading:{name:'Reading room',fixed:['bookcase','bookcase','table','chair'],variable:['books','chair']},
 dining:{name:'Dining room',fixed:['table','table','chair','chair','cupboard'],variable:['chair','books']},
 activity:{name:'Activity room',fixed:['table','table','bookcase','chair'],variable:['chair','books']},
 admissions:{name:'Admissions office',fixed:['table','chair','cupboard','bookcase'],variable:['chair','books']},
 office:{name:'Staff office',fixed:['table','chair','bookcase','cupboard'],variable:['books','chair']},
 staff:{name:'Staff sitting room',fixed:['table','chair','chair','cupboard'],variable:['books','chair']},
 linen:{name:'Linen store',fixed:['cupboard','cupboard','bookcase'],variable:['chair','books']},
 records:{name:'Records room',fixed:['bookcase','bookcase','table','chair'],variable:['books','chair']},
 recordsOffice:{name:'Records office',fixed:['bookcase','table','chair'],variable:['books']},
 archive:{name:'Archive and stores',fixed:['bookcase','bookcase','bookcase','cupboard'],variable:[]},
 store:{name:'General store',fixed:['bookcase','cupboard','cupboard'],variable:['bench','chair']},
 workshop:{name:'Maintenance workshop',fixed:['table','table','cupboard','bench'],variable:['bench','books']},
 sewing:{name:'Sewing room',fixed:[],variable:[]},
 stairs:{name:'Reception stair hall',fixed:[],variable:[]},
 junctionStairs:{name:'West junction stair hall',fixed:[],variable:[]},
 porch:{name:'Court entrance porch',fixed:[],variable:[]},
 circulation:{name:'Basement stair lobby',fixed:[],variable:[]}
};
