# 🎟️ ChainPass

> **Decentralized Event Ticketing Platform**
> Powered by **ERC-4337 Account Abstraction · Chainlink VRF · The Graph (GraphQL)**

---

## 🌟 Overview

ChainPass is a Web3-based event ticketing platform that ensures **security, transparency, and seamless user experience**.

It combines:

* ⚡ **Account Abstraction (Gasless UX)**
* 🎲 **Chainlink VRF (Fair randomness)**
* 📊 **GraphQL (Efficient data querying)**

---

## ❗ Problem Statement

Traditional ticketing systems face:

* ❌ Fake tickets and fraud
* ❌ Bots buying tickets
* ❌ Poor user experience in Web3 (gas fees)
* ❌ Lack of transparency
* ❌ No trust mechanism for organizers

---

## ✅ Our Solution

ChainPass solves these using modern Web3 technologies:

* NFT-based tickets (ERC-721)
* Gasless transactions via **Account Abstraction**
* Fair reward distribution using **Chainlink VRF**
* Fast data access using **GraphQL (The Graph)**

---

## 🔥 Core Features

---

### ⚡ Account Abstraction (ERC-4337)

* Users do **not need ETH for gas**
* Transactions are sent as **UserOperations**
* Gas is sponsored via **Paymaster (Pimlico)**

👉 Makes Web3 experience similar to Web2

---

### 🎲 Chainlink VRF (Verifiable Randomness)

* Used to select a **random cashback winner**
* Ensures:

  * Fairness
  * Transparency
  * No manipulation

👉 Fully verifiable on-chain randomness

---

### 📊 GraphQL (The Graph Protocol)

* Indexes blockchain events
* Enables fast and efficient queries
* Frontend fetches only required data

👉 Improves performance and scalability

---

### 🎟️ NFT-Based Ticketing

* Tickets are minted as **ERC-721 NFTs**
* Ownership is secure and verifiable
* Eliminates fake tickets

---

### 💰 Organizer Staking System

* Organizers stake ETH to create events
* After event:

  * 80% returned
  * Remaining used for rewards

👉 Builds trust and prevents spam

---

### ⭐ Review System

* Users can review events after attending
* Helps future users make decisions

---

### 🖼️ Event Media

* Organizers can add event images
* Enhances UI/UX

---

## 🏗️ Architecture

```id="arch123"
User → Wallet (Wagmi)
        ↓
UserOperation (ERC-4337)
        ↓
Bundler (Pimlico)
        ↓
Paymaster (Gas Sponsored)
        ↓
Smart Account
        ↓
ChainPass Smart Contract
```

---

## 🔗 Tech Stack

| Layer               | Technology       |
| ------------------- | ---------------- |
| Smart Contracts     | Solidity         |
| Blockchain          | Ethereum Sepolia |
| NFTs                | ERC-721          |
| Account Abstraction | ERC-4337         |
| Paymaster           | Pimlico          |
| Randomness          | Chainlink VRF    |
| Indexing            | The Graph        |
| Query Language      | GraphQL          |
| Frontend            | React + Wagmi    |
| Language            | TypeScript       |

---

## ⚙️ How It Works

### 🧩 Event Creation

* Organizer creates event
* Stakes ETH
* Defines ticket price and timings

---

### 🎟️ Ticket Purchase

* User clicks buy
* Transaction sent via **Account Abstraction**
* Paymaster pays gas
* NFT ticket minted

---

### 🎲 Reward System (VRF)

* After event ends
* Chainlink VRF selects random winner
* Cashback sent to winner

---

### 📊 Data Fetching (GraphQL)

* Events fetched via The Graph
* Fast and efficient queries
* Real-time UI updates

---

## 🚀 Unique Selling Points

* ✅ Gasless Web3 experience (Account Abstraction)
* ✅ Fair reward distribution (Chainlink VRF)
* ✅ High performance data layer (GraphQL)
* ✅ Trust-based event system (staking)
* ✅ NFT-based ownership

---

## 🧪 Demo Flow

1. Connect wallet
2. Create event (stake ETH)
3. Buy ticket (gasless)
4. View events (GraphQL)
5. Submit review
6. Trigger VRF winner

---

## 🎯 Conclusion

ChainPass bridges:

👉 Web2 usability (gasless, smooth UX)
👉 Web3 security (decentralized, transparent)

---

