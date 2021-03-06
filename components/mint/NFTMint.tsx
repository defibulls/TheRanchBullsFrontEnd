import { useContext, useEffect, useState } from 'react'
import { useChain, useMoralis } from 'react-moralis'
import Header from '../Header'
import { contractAddress, customStyles } from '../../lib/constants'
import ChainNotSupported from './ChainNotSupported'
import Modal from 'react-modal'
import Loader from '../modals/Loader'
import { ContractContext } from '../../context/ContractContext'
import toast from 'react-hot-toast'

Modal.setAppElement('#__next')

const NFTMint = () => {
  const { user } = useMoralis()
  const { contract } = useContext(ContractContext)
  const { chainId } = useChain()
  const [count, setCount] = useState<number>(1)
  const [loading, setloading] = useState<boolean>(false)
  const [minted, setMinted] = useState<number>(0)
  const [price, setPrice] = useState<any>(0)
  const [mintingPrice, setMintingPrice] = useState<number>(6)
  const [mintedByWallet, setMintedByWallet] = useState<number>(0)
  const [maxMintPerWallet, setMaxMintPerWallet] = useState<number>(100)
  const [paused, setPaused] = useState<boolean>(false)
  const [publicSale, setPublicSale] = useState<boolean>(false)
  const [disabled, setDisabled] = useState<boolean>(false)
  console.log(contract)

  const mint = async () => {
    if (count === 0) return toast.error('Please enter a valid amount')
    if (count > 11)
      return toast.error('You can only mint up to 11 NFTs at a time')

    console.log('count', count)
    console.log(mintedByWallet)

    const totalQuantity = Number(count) + Number(mintedByWallet)
    console.log(totalQuantity)

    if (totalQuantity > maxMintPerWallet)
      return toast.error(
        `You can only mint up to ${maxMintPerWallet} NFTs per Wallet Address`
      )

    await fetchPrice(count)

    setloading(true)

    await contract.methods.mint(count).send(
      {
        from: user?.get('ethAddress'),
        value: mintingPrice,
      },
      (err: any) => {
        if (err) {
          toast.error(err.message)
          setloading(false)
        }
      }
    )

    toast.success("You've sucessfully minted the NFT!")
    setloading(false)
  }

  const fetchPrice = async (count: any) => {
    if (count == 1) {
      setPrice(await contract.methods.ORDER_QUANTITY_1().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    } else if (count === 2) {
      setPrice(await contract.methods.ORDER_QUANTITY_2().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    } else if (count == 3) {
      setPrice(await contract.methods.ORDER_QUANTITY_3().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    } else if (count == 5) {
      setPrice(await contract.methods.ORDER_QUANTITY_5().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    } else if (count == 7) {
      setPrice(await contract.methods.ORDER_QUANTITY_7().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    } else if (count == 11) {
      setPrice(await contract.methods.ORDER_QUANTITY_11().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    } else {
      setPrice(await contract.methods.ORDER_QUANTITY_1().call())
      setMintingPrice(await contract.methods.getMintPrice(price * count).call())
    }
  }

  const fetchData = async () => {
    const mintedNFTs = await contract.methods.totalSupply().call()
    setMinted(mintedNFTs)
    const _mintedByWallet = await contract.methods
      .addressPurchases(user?.get('ethAddress'))
      .call()
    setMintedByWallet(_mintedByWallet)

    const _maxMintByWallet = await contract.methods
      .NODEBULLS_MAX_MINTS_TOTAL_PER_WALLET()
      .call()
    setMaxMintPerWallet(_maxMintByWallet)
    const _mintLive = await contract.methods.paused().call()
    setPaused(_mintLive)

    const _publicLiveSale = await contract.methods.publicSaleLive().call()
    setPublicSale(_publicLiveSale)
  }

  const disable = (a: number, b: number) => {
    console.log(maxMintPerWallet, mintedByWallet)
    if (a == b) {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
  }

  useEffect(() => {
    if (contract) {
      fetchPrice(count)
      fetchData()
    }
  }, [contract, count])

  useEffect(() => {
    if (contract) {
      disable(maxMintPerWallet, mintedByWallet)
    }
  }, [contract, mintedByWallet, maxMintPerWallet])

  const msg =
    'Buy a single Bull or get a prime number bundle discount with 2, 3, 5, 7 or 11 Bulls.'

  return (
    <div className="h-full overflow-y-scroll lg:overflow-hidden">
      <Header />
      <main className="flex flex-col justify-center ">
        <div className="flex min-h-[100vh] w-full flex-col gap-8 p-[10%] text-white md:flex-row md:py-4 md:px-[5%]">
          <div className="flex h-screen w-full flex-col justify-center overflow-hidden">
            {chainId !== '0x13881' ? (
              <ChainNotSupported />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center lg:flex-row">
                <div className="flex h-full w-full lg:h-[60%] lg:w-[60%] ">
                  <iframe src="/08/demo/data.html" height="100%" width="100%">
                    LOGO
                  </iframe>
                </div>

                {paused ? (
                  <div>
                    <p className="mb-1 text-4xl font-black text-cyan-600 underline underline-offset-2">
                      CONTRACT PAUSED
                    </p>
                    <p className="mt-4 text-xl font-bold ">
                      Contract Paused. Please Check Discord.
                      <br />
                      <br />
                    </p>
                    <a
                      href="https://discord.gg/URMH4bSAht"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <button className=" font-sansw-full rounded-md bg-cyan-600 px-4 py-2 font-bold ">
                        CLICK HERE TO JOIN DISCORD
                      </button>
                    </a>
                  </div>
                ) : (
                  <div className="flex w-full flex-col justify-center lg:w-[60%]">
                    <p className="mb-1 text-4xl font-black text-cyan-600 underline underline-offset-2">
                      {publicSale ? 'MINT LIVE' : 'PUBLIC SALE NOT LIVE'}
                    </p>

                    <p className="text-4xl font-black">{minted} / 4999 </p>
                    <p className="text-5xl font-black">
                      EACH <span className="text-purple-600">BULL</span> COSTS{' '}
                      {price}
                      <span className="text-purple-600"> USD</span>
                      <br />
                      <br />
                    </p>
                    <p
                      className={`text-lg font-normal text-cyan-600 ${
                        disabled && 'text-red-500'
                      }`}
                    >
                      {disabled
                        ? `You can only mint upto ${maxMintPerWallet} NFTs per Wallet Address!`
                        : msg.toLocaleUpperCase()}
                      <br />
                      <br />
                    </p>
                    <div className="flex w-fit flex-col items-center gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          disabled={disabled}
                          className="rounded-lg border p-3 "
                          onClick={(e) => {
                            e.preventDefault()
                            if (count == 1) {
                              setCount(1)
                            } else if (count == 2) {
                              setCount(count - 1)
                            } else if (count == 3) {
                              setCount(count - 1)
                            } else if (count == 5) {
                              setCount(count - 2)
                            } else if (count == 7) {
                              setCount(count - 2)
                            } else if (count == 11) {
                              setCount(count - 4)
                            }
                          }}
                        >
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 1024 1024"
                            aria-hidden="true"
                            focusable="false"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path>
                          </svg>
                        </button>
                        <p className="text-2xl font-bold text-cyan-600">
                          {count}
                        </p>
                        <p className="text-2xl font-bold">BULLS</p>
                        <button
                          disabled={disabled}
                          onClick={(e) => {
                            e.preventDefault()
                            if (count == 11) {
                              setCount(11)
                            } else if (count == 1) {
                              setCount(count + 1)
                            } else if (count == 2) {
                              setCount(count + 1)
                            } else if (count == 3) {
                              setCount(count + 2)
                            } else if (count == 5) {
                              setCount(count + 2)
                            } else if (count == 7) {
                              setCount(count + 4)
                            }
                          }}
                          className="rounded-lg border p-3"
                        >
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            //t="1551322312294"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            aria-hidden="true"
                            focusable="false"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs></defs>
                            <path d="M474 152m8 0l60 0q8 0 8 8l0 704q0 8-8 8l-60 0q-8 0-8-8l0-704q0-8 8-8Z"></path>
                            <path d="M168 474m8 0l672 0q8 0 8 8l0 60q0 8-8 8l-672 0q-8 0-8-8l0-60q0-8 8-8Z"></path>
                          </svg>
                        </button>
                      </div>
                      {publicSale && (
                        <>
                          <button
                            disabled={disabled}
                            onClick={mint}
                            className="w-full rounded-md bg-cyan-600 px-4 py-2 disabled:cursor-not-allowed disabled:bg-gray-600"
                          >
                            MINT
                          </button>
                          <p>
                            TOTAL PRICE: <b>{count * price} USD</b>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Modal isOpen={loading} style={customStyles}>
        <Loader />
      </Modal>
    </div>
  )
}

export default NFTMint
