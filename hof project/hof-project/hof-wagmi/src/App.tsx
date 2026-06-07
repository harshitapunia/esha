import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { formatEther, parseEther } from 'viem'
import './App.css'
import { chainPassAddress, sepoliaChainId } from './lib/chainPass'
import { chainPassAbi } from './lib/chainPassAbi'
import { SplashScreen } from './components/SplashScreen'

type EventData = {
  eventId: bigint
  organiser: `0x${string}`
  ticketPrice: bigint
  maxSupply: bigint
  totalMinted: bigint
  saleStartTime: bigint
  saleEndTime: bigint
  eventStartTime: bigint
  eventEndTime: bigint
  organiserStake: bigint
  stakeReturned: boolean
  exists: boolean
}

function toUnixSeconds(value: string): bigint {
  if (!value) return 0n
  return BigInt(Math.floor(new Date(value).getTime() / 1000))
}

function formatUnix(ts: bigint | number): string {
  const n = typeof ts === 'bigint' ? Number(ts) : ts
  if (!n) return '-'
  return new Date(n * 1000).toLocaleString()
}

// Icons
const IconActivity = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>)
const IconWallet = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>)
const IconCalendar = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>)
const IconTicket = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>)
const IconSearch = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>)
const IconPlus = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>)
const IconStore = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path><path d="M2 7h20"></path><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path></svg>)
const IconAward = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>)
const IconShield = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>)

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { address, isConnected, chainId } = useAccount()
  const publicClient = usePublicClient({ chainId: sepoliaChainId })
  const { connectors, connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: txHash, error: writeError, isPending: isWritePending, writeContract } =
    useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  // UI state for pages
  const [activeTab, setActiveTab] = useState<'events' | 'marketplace' | 'staking' | 'portfolio' | 'create_event'>('events')
  const [localUiError, setLocalUiError] = useState<string | null>(null)

  const [lookupEventId, setLookupEventId] = useState('1')

  const [createName, setCreateName] = useState('')
  const [createVenue, setCreateVenue] = useState('')
  const [createPriceEth, setCreatePriceEth] = useState('0.001')
  const [createSupply, setCreateSupply] = useState('100')
  const [createSaleStart, setCreateSaleStart] = useState('')
  const [createSaleEnd, setCreateSaleEnd] = useState('')
  const [createEventStart, setCreateEventStart] = useState('')
  const [createEventEnd, setCreateEventEnd] = useState('')
  const [createStakeEth, setCreateStakeEth] = useState('0.01')

  const [buyEventId, setBuyEventId] = useState('1')
  const [buyPriceEth, setBuyPriceEth] = useState('0.001')

  const [listTokenId, setListTokenId] = useState('1')
  const [listPriceEth, setListPriceEth] = useState('0.001')
  const [buyResaleTokenId, setBuyResaleTokenId] = useState('1')
  const [buyResalePriceEth, setBuyResalePriceEth] = useState('0.001')
  const [cancelTokenId, setCancelTokenId] = useState('1')

  const [reviewEventId, setReviewEventId] = useState('1')
  const [reviewContentHash, setReviewContentHash] = useState('ipfs://')
  const [winnerEventId, setWinnerEventId] = useState('1')

  const totalEvents = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getTotalEvents',
    query: { refetchInterval: 10000 },
  })

  const totalMinted = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getTotalTicketsMinted',
    query: { refetchInterval: 10000 },
  })

  const eventDetails = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getEvent',
    args: [lookupEventId ? BigInt(lookupEventId) : 0n],
    query: { enabled: Boolean(lookupEventId) },
  })

  const walletTickets = useReadContract({
    address: chainPassAddress,
    abi: chainPassAbi,
    functionName: 'getWalletTickets',
    args: [address!],
    query: {
      enabled: Boolean(address),
      refetchInterval: 10000,
    },
  })

  const eventData = useMemo(() => {
    return eventDetails.data as EventData | undefined
  }, [eventDetails.data])

  const saleStatus = useMemo(() => {
    if (!eventData) return null
    const now = Math.floor(Date.now() / 1000)
    if (now < Number(eventData.saleStartTime)) return 'Upcoming'
    if (now >= Number(eventData.saleEndTime)) return 'Closed'
    return 'Active'
  }, [eventData])

  const txState = useMemo(() => {
    if (isWritePending) return 'Waiting for wallet signature...'
    if (isConfirming) return 'Transaction submitted. Waiting for confirmation...'
    if (isConfirmed && txHash) return `Confirmed: ${txHash}`
    if (writeError) return `Error: ${writeError.message}`
    if (localUiError) return `Error: ${localUiError}`
    return 'Systems operational. Ready for transactions.'
  }, [isWritePending, isConfirming, isConfirmed, txHash, writeError, localUiError])

  const wrongChain = isConnected && chainId !== sepoliaChainId

  const onCreateEvent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'createEvent',
      args: [
        {
          name: createName,
          venue: createVenue,
          ticketPrice: parseEther(createPriceEth),
          maxSupply: BigInt(createSupply),
          saleStartTime: toUnixSeconds(createSaleStart),
          saleEndTime: toUnixSeconds(createSaleEnd),
          eventStartTime: toUnixSeconds(createEventStart),
          eventEndTime: toUnixSeconds(createEventEnd),
        },
      ],
      value: parseEther(createStakeEth),
    } as any) // TS ignore wagmi signature strict check
  }

  const onBuyTicket = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    const eventId = BigInt(buyEventId)
    const ticketPrice = parseEther(buyPriceEth)

    try {
      if (!publicClient) {
        throw new Error('Public client unavailable. Please reconnect wallet and retry.')
      }

      const event = (await publicClient.readContract({
        address: chainPassAddress,
        abi: chainPassAbi,
        functionName: 'getEvent',
        args: [eventId],
      } as any)) as EventData // TS ignore wagmi signature strict check

      const now = Math.floor(Date.now() / 1000)

      if (!event.exists) {
        throw new Error('Event does not exist.')
      }

      if (now < Number(event.saleStartTime) || now >= Number(event.saleEndTime)) {
        throw new Error('Sale is not open for this event. Use an active sale window.')
      }

      if (ticketPrice < event.ticketPrice) {
        throw new Error(`Insufficient ETH. Minimum required is ${formatEther(event.ticketPrice)} ETH.`)
      }

      if (event.totalMinted >= event.maxSupply) {
        throw new Error('Event is sold out.')
      }

      if (!address) {
        throw new Error('Connect wallet before buying a ticket.')
      }

      const ticketsBoughtForEvent = (await publicClient.readContract({
        address: chainPassAddress,
        abi: chainPassAbi,
        functionName: 'ticketsBought',
        args: [eventId, address],
      } as any)) as bigint // TS ignore wagmi signature strict check

      if (ticketsBoughtForEvent >= 2n) {
        throw new Error('Max 2 tickets per wallet reached for this event.')
      }

      writeContract({
        address: chainPassAddress,
        abi: chainPassAbi,
        functionName: 'buyTicket',
        args: [eventId],
        value: ticketPrice,
      } as any) // TS ignore wagmi signature strict check

    } catch (error: any) {
      setLocalUiError(error.message)
      console.error('[buyTicket] Pre-flight validation or submission failed', error)
    }
  }

  const onListResale = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'listForResale',
      args: [BigInt(listTokenId), parseEther(listPriceEth)],
    } as any) // TS ignore wagmi signature strict check
  }

  const onBuyResale = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'buyResaleTicket',
      args: [BigInt(buyResaleTokenId)],
      value: parseEther(buyResalePriceEth),
    } as any) // TS ignore wagmi signature strict check
  }

  const onCancelResale = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'cancelResaleListing',
      args: [BigInt(cancelTokenId)],
    } as any) // TS ignore wagmi signature strict check
  }

  const onSubmitReview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'submitReview',
      args: [BigInt(reviewEventId), reviewContentHash],
    } as any) // TS ignore wagmi signature strict check
  }

  const onPickWinner = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalUiError(null)
    writeContract({
      address: chainPassAddress,
      abi: chainPassAbi,
      functionName: 'requestReviewDropWinner',
      args: [BigInt(winnerEventId)],
    } as any) // TS ignore wagmi signature strict check
  }

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <IconShield /> ChainPass
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`} 
            onClick={() => setActiveTab('events')}
          >
            <IconCalendar /> Browse Events
          </button>
          <button 
            className={`nav-item ${activeTab === 'marketplace' ? 'active' : ''}`} 
            onClick={() => setActiveTab('marketplace')}
          >
            <IconStore /> Secondary Marketplace
          </button>
          <button 
            className={`nav-item ${activeTab === 'staking' ? 'active' : ''}`} 
            onClick={() => setActiveTab('staking')}
          >
            <IconAward /> Staking & Reputation
          </button>
          <button 
            className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`} 
            onClick={() => setActiveTab('portfolio')}
          >
            <IconTicket /> My Tickets
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="btn-list-event" onClick={() => setActiveTab('create_event')}>
            <IconPlus /> List Your Event
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP NAVBAR */}
        <header className="topbar">
          <div className="page-title">
            {activeTab === 'events' && 'Browse Events'}
            {activeTab === 'marketplace' && 'Secondary Market'}
            {activeTab === 'staking' && 'Staking & Rewards'}
            {activeTab === 'portfolio' && 'My Tickets Portfolio'}
            {activeTab === 'create_event' && 'Create New Event'}
          </div>
          
          <div className="topbar-actions">
            <div className={`tx-status-indicator ${isConfirmed ? 'success' : (writeError || localUiError ? 'error' : '')}`} title={txState}>
              <IconActivity /> {txState}
            </div>

            {wrongChain && <span className="warn" style={{ marginTop: 0, padding: '0.4rem 0.8rem' }}>Switch to Sepolia</span>}

            {!isConnected ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    className="wallet-connect-btn"
                    onClick={() => connect({ connector })}
                    disabled={isConnecting}
                  >
                    Connect {connector.name}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="wallet-badge">
                  <IconWallet /> {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <button className="wallet-connect-btn" onClick={() => disconnect()}>Disconnect</button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="page-content">
          
          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <>
              <header className="hero">
                <div className="hero-contract">
                  Protocol Contract: <span>{chainPassAddress}</span>
                </div>
                <h1>Experience live events like never before.</h1>
                <div className="stats" style={{ marginTop: '0' }}>
                  <article>
                    <h3>Total Global Events</h3>
                    <p>{totalEvents.data ? totalEvents.data.toString() : '0'}</p>
                  </article>
                  <article>
                    <h3>Total Tickets Minted</h3>
                    <p>{totalMinted.data ? totalMinted.data.toString() : '0'}</p>
                  </article>
                </div>
              </header>

              <div className="event-showcase-grid">
                {/* Lookup Event / View Details */}
                <article className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2><IconSearch /> Find Event</h2>
                    {saleStatus && (
                      <span className={`status-badge ${saleStatus.toLowerCase()}`}>
                         {saleStatus === 'Active' ? '🟢 Live Now' : (saleStatus === 'Upcoming' ? '🟡 Upcoming' : '🔴 Sale Ended')}
                      </span>
                    )}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); eventDetails.refetch(); }}>
                    <label>
                      Event ID Reference
                      <input value={lookupEventId} onChange={(e) => setLookupEventId(e.target.value)} type="number" min="1" placeholder="Search by ID" />
                    </label>
                    <button type="submit">View Event Details</button>
                  </form>
                  {eventData && (
                    <div className="detail-block">
                      <div className="detail-section-label">🎟️ Ticket Info</div>
                      <p><span>Organiser</span> <span className="value">{eventData.organiser}</span></p>
                      <p><span>Ticket Price</span> <span className="value">{formatEther(eventData.ticketPrice)} ETH</span></p>
                      <p><span>Availability</span> <span className="value">{eventData.totalMinted.toString()} / {eventData.maxSupply.toString()} sold</span></p>
                      <p><span>Organiser Stake</span> <span className="value">{formatEther(eventData.organiserStake)} ETH</span></p>
                      <p><span>Stake Returned</span> <span className="value">{eventData.stakeReturned ? '✅ Yes' : '⏳ No'}</span></p>

                      <div className="detail-section-label" style={{ marginTop: '1rem' }}>🗓️ Sale Window</div>
                      <p><span>Sale Opens</span> <span className="value">{formatUnix(eventData.saleStartTime)}</span></p>
                      <p><span>Sale Closes</span> <span className="value">{formatUnix(eventData.saleEndTime)}</span></p>

                      <div className="detail-section-label" style={{ marginTop: '1rem' }}>📍 Event Schedule</div>
                      <p><span>Event Starts</span> <span className="value">{formatUnix(eventData.eventStartTime)}</span></p>
                      <p><span>Event Ends</span> <span className="value">{formatUnix(eventData.eventEndTime)}</span></p>
                    </div>
                  )}
                </article>

                {/* Mint Ticket Component */}
                <article className="panel">
                  <h2><IconTicket /> Mint Primary Ticket</h2>
                  <form onSubmit={onBuyTicket}>
                    <label>
                      Target Event ID
                      <input value={buyEventId} onChange={(e) => setBuyEventId(e.target.value)} type="number" min="1" required />
                    </label>
                    <label>
                      Amount to Pay (ETH)
                      <input value={buyPriceEth} onChange={(e) => setBuyPriceEth(e.target.value)} placeholder="0.00" required />
                    </label>
                    <button type="submit" disabled={saleStatus === 'Closed' && buyEventId === lookupEventId}>
                      {saleStatus === 'Closed' && buyEventId === lookupEventId ? 'Sale Not Active' : 'Checkout & Mint Pass'}
                    </button>
                  </form>
                </article>
              </div>
            </>
          )}

          {/* MARKETPLACE TAB */}
          {activeTab === 'marketplace' && (
            <div className="event-showcase-grid">
              <article className="panel">
                <h2><IconStore /> Buy from Reseller</h2>
                <form onSubmit={onBuyResale}>
                  <label>
                    Listed Token ID
                    <input
                      value={buyResaleTokenId}
                      onChange={(e) => setBuyResaleTokenId(e.target.value)}
                      type="number"
                      min="1"
                      required
                    />
                  </label>
                  <label>
                    Payment Amount (ETH)
                    <input value={buyResalePriceEth} onChange={(e) => setBuyResalePriceEth(e.target.value)} placeholder="0.00" required />
                  </label>
                  <button type="submit">Purchase Resale Ticket</button>
                </form>
              </article>

              <article className="panel">
                <h2>List your Ticket</h2>
                <form onSubmit={onListResale}>
                  <label>
                    Your NFT Token ID
                    <input value={listTokenId} onChange={(e) => setListTokenId(e.target.value)} type="number" min="1" required />
                  </label>
                  <label>
                    Asking Price (ETH)
                    <input value={listPriceEth} onChange={(e) => setListPriceEth(e.target.value)} placeholder="0.00" required />
                  </label>
                  <button type="submit">List in Marketplace</button>
                </form>
              </article>

              <article className="panel">
                <h2>Manage Listings</h2>
                <form onSubmit={onCancelResale}>
                  <label>
                    Active Listing Token ID
                    <input value={cancelTokenId} onChange={(e) => setCancelTokenId(e.target.value)} type="number" min="1" required />
                  </label>
                  <button type="submit" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Cancel Listing</button>
                </form>
              </article>
            </div>
          )}

          {/* STAKING & REWARDS TAB */}
          {activeTab === 'staking' && (
            <div className="event-showcase-grid">
              <article className="panel">
                <h2><IconAward /> Submit Reputation Review</h2>
                <form onSubmit={onSubmitReview}>
                  <label>
                    Attended Event ID
                    <input value={reviewEventId} onChange={(e) => setReviewEventId(e.target.value)} type="number" min="1" required />
                  </label>
                  <label>
                    IPFS Hash (Review Content)
                    <input
                      value={reviewContentHash}
                      onChange={(e) => setReviewContentHash(e.target.value)}
                      placeholder="ipfs://..."
                      required
                    />
                  </label>
                  <button type="submit">Broadcast Review securely</button>
                </form>
              </article>

              <article className="panel">
                <h2>VRF Giveaway Winner</h2>
                <form onSubmit={onPickWinner}>
                  <label>
                    Eligible Event ID
                    <input value={winnerEventId} onChange={(e) => setWinnerEventId(e.target.value)} type="number" min="1" required />
                  </label>
                  <button type="submit">Execute Secure VRF Randomness</button>
                </form>
              </article>
            </div>
          )}

          {/* MY TICKETS / PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <article className="panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <h2><IconTicket /> My Portfolio Inventory</h2>
              {!address && (
                <div className="warn" style={{ marginTop: 0 }}>Connect wallet to decrypt holdings.</div>
              )}
              {address && (
                <div className="detail-block">
                  {(walletTickets.data || []).length === 0 && <p style={{ border: 'none', justifyContent: 'center', opacity: 0.7 }}>No active passes in wallet</p>}
                  {(walletTickets.data || []).map((id) => (
                    <p key={id.toString()}><span>ChainPass NFT</span> <span className="value" style={{fontFamily: 'JetBrains Mono'}}>#{id.toString()}</span></p>
                  ))}
                </div>
              )}
            </article>
          )}

          {/* CREATE EVENT TAB */}
          {activeTab === 'create_event' && (
            <article className="panel" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <h2><IconPlus /> Define & Deploy New Event</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-1rem' }}>
                Create a decentralised event structure. You will be prompted to deposit the required ETH stake collateral to ensure event integrity.
              </p>
              <form onSubmit={onCreateEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <label>
                  Event Name
                  <input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. ETH Global Hackathon" required />
                </label>
                <label>
                  Venue / Location
                  <input value={createVenue} onChange={(e) => setCreateVenue(e.target.value)} placeholder="Virtual or Physical" required />
                </label>
                <label>
                  Ticket Price (ETH)
                  <input value={createPriceEth} onChange={(e) => setCreatePriceEth(e.target.value)} placeholder="0.00" required />
                </label>
                <label>
                  Max Supply Limit
                  <input value={createSupply} onChange={(e) => setCreateSupply(e.target.value)} type="number" min="1" required />
                </label>
                <label>
                  Sale Window Start
                  <input value={createSaleStart} onChange={(e) => setCreateSaleStart(e.target.value)} type="datetime-local" required />
                </label>
                <label>
                  Sale Window End
                  <input value={createSaleEnd} onChange={(e) => setCreateSaleEnd(e.target.value)} type="datetime-local" required />
                </label>
                <label>
                  Event Date Start
                  <input value={createEventStart} onChange={(e) => setCreateEventStart(e.target.value)} type="datetime-local" required />
                </label>
                <label>
                  Event Date End
                  <input value={createEventEnd} onChange={(e) => setCreateEventEnd(e.target.value)} type="datetime-local" required />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  Collateral Stake (ETH)
                  <input value={createStakeEth} onChange={(e) => setCreateStakeEth(e.target.value)} placeholder="0.00" required />
                </label>
                <button type="submit" style={{ gridColumn: '1 / -1', padding: '1.25rem' }}>
                  Deploy Event Contract
                </button>
              </form>
            </article>
          )}

        </div>
      </main>
    </div>
  )
}

export default App
