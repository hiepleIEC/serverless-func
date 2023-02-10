
const getAllChannels = async (channelId,data=[])=>{
 if(!channelId) return data;
 const channel = await discordApi.getChannel(channelId);
 data.push(channel);
 return getAllChannels(channel.parent_id)
 // if(channel.parent_id){ // if 3 level => early project
 //   const parentChannel = await discordApi.getChannel(channel.parent_id);
 //   // // console.log({parentChannel})
 //   console.log({parentChannel})
 // }
}