// const updateUserData = async (userId) => {
//   await WalletUserModel.updateOne({
//     { id : 330250099 },
//     { $push: 
//       {main: 
//         {usdt: 0,
//         mine: 0,
//         plex: 0,
//         ddao: 0
//         }} }
//   });

  await WalletUser.updateMany(
    { id: 330250099 }, 
    JSON.parse(`{ "$set" : { "minePlex.address": "", "minePlex.sk": "", "minePlex.pk": "", "usdt.address": "", "usdt.privateKey": "" } }`)
  );

  async function startTe() {
    const users = await WalletUserModel.find({});
    users.map(async (u) => {
        await WalletUserModel.updateOne({ id: u.id }, { $set: { mnemonic: u.del.mnemonics } })
        const userd = await WalletUserModel.findOne({ id: u.id })
        userd.del.mnemonics = undefined;
        await userd.save();
        console.log(await WalletUserModel.findOne({ id: u.id }));
    })
}



