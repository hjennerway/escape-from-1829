// Player numbers follow enclosed door rooms, preserving internal modelling IDs.
export function asylumRoomNumbers(floor){
 const ids=[...new Set((floor.roomDoors??[]).map(d=>d.roomId))].sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
 return new Map(ids.map((id,i)=>[id,({0:`G${i+1}`,1:String(101+i),2:`B${i+1}`,3:String(201+i)})[floor.id]]));
}

// Historical plan references describe the model, rather than a visible room.
export const asylumDisplayName=name=>name.replace(/\s*\(former R\d+\)/g,'').replace(/^Former R\d+\s+/,'');
