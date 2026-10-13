export const rooms=[
  {id:'statistics',label:'STATISTICAL ANALYSIS',name:'Statistical Analysis',symbol:'◈',description:'The constellations in your story',status:'Recorded counts and source evidence'},
  {id:'podcast',label:'PODCAST OVERVIEW',name:'Podcast Overview',symbol:'♬',description:'Listen to your dreaming life',status:'Audio generation is not connected'},
  {id:'oracle',label:'ORACLE CARDS',name:'Oracle Cards',symbol:'✧',description:'A thread of meaning, illuminated',status:'Evidence reflection and saved history'},
  {id:'dream-journal',label:'DREAM JOURNAL',name:'Dream Journal',symbol:'☾',description:'Keep what the night brings',status:'Write, edit, save and revisit'},
  {id:'waking-journal',label:'WAKING JOURNAL',name:'Waking Journal',symbol:'☼',description:'The other half of your story',status:'A separate waking-life journal'},
  {id:'collections',label:'MY COLLECTIONS/ MY FAVE COLLECTIONS',name:'My Collections/ My Fave Collections',symbol:'❋',description:'Your cabinet of dream treasures',status:'Saved favourites from your journals and readings'},
  {id:'luminous',label:'LUMINOUS MESSAGES',name:'Luminous Messages',symbol:'✶',description:'Return to what feels significant',status:'Your personally marked dreams'},
  {id:'dream-world',label:'DREAM WORLD',name:'Dream World',symbol:'◎',description:'Enter the landscapes of your dreams',status:'Preserved Sam and Natalie reference worlds'},
  {id:'insights',label:'DREAM INSIGHTS/ COLLECTIVE DREAM INSIGHTS',name:'Dream Insights/ Collective Dream Insights',symbol:'✦',description:'See the story unfolding',status:'Evidence summaries; AI reports are not connected'},
];
export const roomById=id=>rooms.find(r=>r.id===id);
