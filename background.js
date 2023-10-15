chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  function main() {
    const coins = JSON.parse(localStorage.getItem("coins")) || {};
    const lastAlertCoins =
      JSON.parse(localStorage.getItem("lastAlertCoins")) || {};
    const time = 60 * 5;
    const perc = 2;

    if (
      location.href ===
      "https://futures.mexc.com/exchange/BTC_USDT?type=linear_swap"
    ) {
      const getCoinFromEl = (el) => ({
        name: el
          .getElementsByClassName(
            "pages-contract-contractdetail-favlist-name"
          )[0]
          .textContent.split(" ")[0],
        price: +el
          .getElementsByClassName(
            "pages-contract-contractdetail-favlist-item_info2"
          )[0]
          .textContent.replaceAll(",", ""),
      });
      const getCoinsList = () => {
        return Array.from(
          document.getElementsByClassName(
            "pages-contract-contractdetail-favlist-itemWrapper"
          )[0].children
        );
      };

      getCoinsList().forEach((el) => {
        const { name, price } = getCoinFromEl(el);
        if (!coins[name]) {
          coins[name] = [price];
        } else {
          if (coins[name].length >= time) {
            coins[name] = [...coins[name].slice(1), price];
          } else {
            coins[name].push(price);
          }
        }

        const minPriceToPercent =
          Math.min(...coins[name]) + (Math.min(...coins[name]) * perc) / 100;
        if (Math.max(...coins[name]) >= minPriceToPercent) {
          const priceDirection = lastAlertCoins[name]
            ? lastAlertCoins[name] > price
              ? "-"
              : "+"
            : "";
          const alert = `${name} ${priceDirection}${+(
            ((Math.max(...coins[name]) - Math.min(...coins[name])) /
              Math.min(...coins[name])) *
            100
          ).toFixed(3)}%`;
          const url = `https://futures.mexc.com/exchange/${
            name === "LUNA"
              ? "LUNANEW"
              : name === "TON"
              ? "TONCOIN"
              : name === "BNX"
              ? "BNXNEW"
              : name
          }_USDT?type=linear_swap`;

          new Notification("Price Alert", {
            body: alert,
          }).addEventListener("click", function () {
            location.href = url;
          });
          lastAlertCoins[name] = price;
          coins[name] = [price];
        }
      });
      localStorage.setItem("lastAlertCoins", JSON.stringify(lastAlertCoins));
      localStorage.setItem("coins", JSON.stringify(coins));
    }

    return coins;
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: main,
  });
});
