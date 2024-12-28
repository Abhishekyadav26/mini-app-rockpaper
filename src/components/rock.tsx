import { useState } from "react";
import { ConnectButton, TransactionButton, useActiveAccount, useActiveWallet, useDisconnect, useReadContract } from "thirdweb/react";
import { client } from "../client";
import { shortenAddress } from "thirdweb/utils";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { claimTo, getBalance } from "thirdweb/extensions/erc20";



type choice = 'Rock' | 'paper' | 'scissors';
type Result = 'Win' | 'lose' | 'Tie';

const choices: choice[] = ["Rock","paper","scissors"];
const getComputerChoice = (): choice => choices[Math.floor(Math.random() * choices.length)];

const determineWinner = (playerChoice: choice, computerChoice:choice):Result => {
    if(playerChoice === computerChoice) return 'Tie';
    if(
        (playerChoice ==='Rock' && computerChoice ==='scissors') ||
        (playerChoice ==='paper' && computerChoice ==='Rock') ||
        (playerChoice ==='scissors' && computerChoice ==='paper')
    ){
        return 'Win';
    }
    return 'lose';
}

interface GameResult {
    playerChoice: choice;
    computerChoice: choice;
    gameResult: Result;
}

export default function RockPaperScissors(){
    const account = useActiveAccount();
    const {disconnect} = useDisconnect();
    const wallet = useActiveWallet();

    const contract = getContract({
        client: client,
        chain: defineChain(545),
        address: "0xBC0dFC7DaBb02617b906841E38E180e403631435"
    });

    const [Result, setResult] = useState<GameResult | null>(null);
    const [showPrize, setShowPrize] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [prizeClaimed, setPrizeClaimed] = useState<boolean>(false);

    const HandleChoice = (playerChoice: choice) =>{
        const computerChoice = getComputerChoice();
        const gameResult = determineWinner(playerChoice ,computerChoice);
        setResult({playerChoice,computerChoice, gameResult});
        setShowPrize(gameResult === 'Win');
    }

    const resetGame = () =>{
        setResult(null);
        setShowPrize(false);
        setPrizeClaimed(false);
    }

    const claimPrize = () =>{
        setShowModal(true);
    }

    const {data: tokenbalance} = useReadContract(
        getBalance,{
            contract: contract,
            address:account?.address!
        }
    )

    return(
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f0f0f0',
            color: '#333'     
        }}>
        <div style={{
                padding: '2rem',
                margin: '0 0.5rem',
                width: '400px',
                maxWidth: '98%',
                height: '400px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative'
            }}>
                <h1 style={{
                    fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center'
                }}>Mini Game</h1>
                {!account ? (
                    <ConnectButton
                    client={client}  
                    />

                ) : (
                    <>
                    <div style={
                        {
                            display: 'flex',
                            flexDirection: 'row',
                            height: 'auto',
                            width: '100%',
                            gap: '0.5rem',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #f0f0f0',
                            padding: '0.5rem',
                        }}
                    >
                        <div>
                            <p style={{
                                fontSize :'0.5rem',
                                marginBottom: '-10px',
                                marginTop: '-10px'
                            }}
                            >{shortenAddress(account.address)}</p>
                            <p style={{
                                fontSize: '0.75rem',
                                marginBottom: '-10px'
                            }}
                            >Balance: {tokenbalance?.displayValue}</p>
                        </div>
                        <button
                        onClick={()=> disconnect(wallet!)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                        }}
                        >Logout</button>
                    </div>

                    {!Result ? (
                    <div>
                    <h3>Choose your option:</h3>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        margin: "2rem"
                    }}>
                        {choices.map((choice)=>(
                            <button
                                key={choice}
                                onClick={() => HandleChoice(choice)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '3rem'
                                }}
                            >
                                {
                                    choice === 'Rock' ? '🪨' :
                                    choice === 'paper' ? '📄' :
                                    '✂️'
                                }
                            </button>
                        ))}
                    </div>
                </div>
                ):(
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center'
                    }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: '-10px' }}>
                            You chose: {Result.playerChoice}
                        </p>
                        <p style={{ fontSize: '1.5rem', marginBottom: '-20px' }}>
                            Computer chose: {Result.computerChoice}
                        </p>
                        <p style={{ fontWeight: 'bold', fontSize: '2rem' }}>
                            Result: {Result.gameResult}
                        </p>
                        <div style={
                            {
                                position: 'absolute',
                                bottom: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                alignItems: 'center'
                            }}>
                                <button
                                    onClick={resetGame}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                        }}
                                >Try Again</button>
                                {showPrize && !prizeClaimed && (
                                    <button
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: '#ffc107',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={claimPrize}
                                    >Clain Prize</button>
                                )}
                                {
                                    showModal && (
                                        <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                background: 'white',
                                                padding: '2rem',
                                                borderRadius: '8px',
                                                maxWidth: '300px',
                                                textAlign: 'center'
                                            }}>
                                                <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Claim 10 Tokens!</h2>
                                                <p style={{ marginBottom: '1rem' }}>You won and can claim 10 tokens to your wallet.</p>

                                                <TransactionButton 
                                                  transaction={()=>claimTo({
                                                    contract: contract,
                                                    to: account.address,
                                                    quantity: "10"
                                                })}
                                                  onTransactionConfirmed={() => {
                                                    alert('Prize claimed!')
                                                    setShowModal(false)
                                                    setPrizeClaimed(true)
                                                  }}
                                                  style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                  }}
                                                >Claim Prize</TransactionButton>
                                            </div>
                                        </div>
                                 )}
                        </div>
                    </div>
                )}
                    </>
                )}
                
                
                
            </div>
        </div>
    )
}