const crossfiService = require("../function/crossfi/crossfiService");

const main = async (param) => {
  try {
    const data = await crossfiService.getUserTx(param);

    console.log(data);

    console.log('test done');
  } catch (error) {
    console.error(error);
    console.log('test error');
  }
}

(async () => {
  const address = 'mx1gkqazfgq8tmc6r69u6s6wzlvcz7lufy75n2qtt';
  const hash = '09a76187f9afeaf48f081a884eb9c8830405c723e2e48949b5b2cee6e6a8ce70'
  await main(address);
})();