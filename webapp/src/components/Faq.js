import React from 'react';
export const Faq = () => {
  return <div className="page-content">

    <h1>Frequently asked questions</h1>
    <h3>Betting</h3>
    <ul className="list-none">
      <li>
        <h4>Do I need any special software to bet on Binary Cat?</h4>
        <p>The only software you need is a web browser compatible with the Metamask extension (<a href="https://metamask.io/" target="_blank">https://metamask.io/</a>).</p>
      </li>

      <li>
        <h4>What exactly am I betting in?</h4>
        <p>You are betting on whether the price of a crypto asset will go up or down in the next 10 minutes.</p>
      </li>

      <li>
        <h4>How does the betting cycle work?</h4>
        <p>The betting window has an average duration of 10 minutes. In each window, there are 3 stages:</p>
        <ul className="list-disc list-outside pl-5">
          <li>Open for betting: formation of the pool by collecting bets for the time slot.</li>
          <li>Ongoing: bets that are waiting to be resolved.</li>
          <li>Finalized: bets that are settled.</li>
        </ul>

        <p>When the 10 minute expires:</p>
        <ul className="list-disc list-outside pl-5">
          <li>Ongoing bets are settled and go to the finalized stage.</li>
          <li>The bets collected during Open For betting become ongoing.</li>
          <li>Open for betting starts to collect bets for the new pool.</li>
        </ul>
      </li>

      <li>
        <h4>How are prices to settle bets defined?</h4>
        <p>The prices are computed from the Chainlink onchain oracle (<a href="https://chain.link/" target="_blank">https://chain.link/</a>). The initial price is set as the first price update after the betting window becomes ongoing and the final price as the first update after the betting window is finalized.</p>
      </li>

      <li>
        <h4>What happens if there is a problem with the price update?</h4>
        <p>If either the initial price or the final price are missing after the window has been finalized, the result will count as a tie and users will get their bets back.</p>
      </li>

      <li>
        <h4>How much is the fee?</h4>
        <p>There is a 2% fee on the amount of bets placed. For example, if you bet 0.5 BNB, 0.01 BNB will count towards the fee and your effective betted amount will be 0.49 BNB.</p>
        <p>There is no fee or rake on winnings.</p>
      </li>

      <li>
        <h4>Is there a maximum or minimum betting limit?</h4>
        <p>The user interface allows inputs with maximum precision of 2 decimals points, meaning that through the website the minimum bet amount should be 0.01 BNB.</p>
        <p>If you are comfortable interacting directly with the blockchain, there is no limit / restriction to betting.</p>
      </li>

      <li>
        <h4>What do I win if I get it right?</h4>
        <p>If you bet correctly, you will receive part of the betting pool in proportion to the amount you bet in relation to all correct bets. For example:</p>
        <p>Your bet size: 10 BNB
        <br/>Total pool: 100 BNB
        <br/>Correct bets: 30 BNB
        <br/>Wrong bets: 70 BNB
        <br/>
        <br/>Winnings = (10/30)*100 = 33.33 BNB</p>
      </li>

      <li>
        <h4>And what if I don’t get it right?</h4>
        <p>Not all is lost. You are still entitled to receive KITTY tokens as a reward for betting. The amount of KITTYs you receive is proportional to the size of your bet in relation to the entire betting pool for the window.</p>
      </li>

      <li>
        <h4>Do I need to deposit BNB to bet?</h4>
        <p>No. If you choose to bet without depositing BNB on the platform, you can send funds with each individual bet. The user interface and Metamask will handle the values accordingly.</p>
      </li>

      <li>
        <h4>What is the advantage of depositing?</h4>
        <p>By depositing money you save on the gas fee. When you deposit, you only have to transfer funds once instead of at every bet.</p>
      </li>

      <li>
        <h4>Where do my winnings go?</h4>
        <p>The winnings will contribute to your platform balance. You can use your winnings to bet again or process a withdrawal to your personal Metamask wallet.</p>
      </li>

      <li>
        <h4>How do I withdraw my funds?</h4>
        <p>On the top of the page you can find the WITHDRAW button. Simply click it, enter the amount you wish to withdraw (or use the MAX button to withdraw your entire balance), and confirm. A Metamask prompt will ask you to confirm the transaction and the funds will be immediately sent to your account.</p>
      </li>

      <li>
        <h4>What do the values on the top of the screen mean:</h4>
        <p>Balance: the amount you have deposited to the platform or that you have gained by betting. This value is available to be withdrawn or to be used to keep betting.</p>
        <p>Winning Percentage: how accurate you are on your bets. For example, if you bet 80 times and select the correct result (up or down) 50 times, your winning percentage will be 62.5%.</p>
        <p>Total Winnings: the sum of all money you received from winning pools (including your original bet amount).</p>
      </li>
    </ul>

    <h3>KITTY Token</h3>
    <ul className="list-none">
      <li>
        <h4>What are KITTY Tokens?</h4>
        <p>The Binary Cat platform is not owned by anyone, it is fully decentralized. The KITTY token is the tool that allows shared ownership of Binary Cat.</p>
      </li>

      <li>
        <h4>What can I do with my KITTY Tokens?</h4>
        <p>Stake: All betting fees generated in the platform are distributed to stakers in proportion to their staked amounts.</p>
        <p>Governance: In the future, token holders will be able to participate in the governance system, voting on bet parameters such as betting fees and betting window duration.</p>
      </li>

      <li>
        <h4>How are Kitty Tokens created?</h4>
        <p>A small amount of KITTY tokens will be distributed in the first year to initial investors and backers of the project. Most of the tokens (approximately 65%) will be locked and distributed as an incentive for betting (check “And what if I don’t get it right?” above) in a fixed rate per betting window. We expect 2 years until all tokens are circulating.</p>
      </li>
    </ul>

    <h3>Staking</h3>
    <ul className="list-none">
      <li>
        <h4>What do I have to gain by staking?</h4>
        <p>By staking tokens you become eligible for receiving the fees generated by the Binary Cat platform.</p>
      </li>

      <li>
        <h4>How do I stake my tokens?</h4>
        <p>Staking can be done through the page <a href="https://staking.binarycat.app" target="_blank">staking.binarycat.app</a>.</p>
      </li>

      <li>
        <h4>Can I retrieve my tokens anytime?</h4>
        <p>Yes. There is no lock or grace period, you can stake or unstake tokens at any time.</p>
      </li>
    </ul>

  </div>;
};
