import React from "react"
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit"

const test = () => {
  const account = useCurrentAccount()

  return (
    <div>
      <p>test</p>
      <nav>
        <ConnectButton />
      </nav>
      <section>
        {account?.address
          ? `Your address is ${account?.address}`
          : "No wallet connected"}
      </section>
    </div>
  )
}

export default test
