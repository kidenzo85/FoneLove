import { useConnectCoinStore } from './src/lib/connectcoin-store'
import assert from 'node:assert'

// Setup mock fetch
const originalFetch = global.fetch;

async function runTests() {
  console.log("Starting tests...")
  
  try {
    // TEST 1: Spend credits successfully
    global.fetch = async (url, options) => {
      const body = JSON.parse(options.body as string)
      return {
        ok: true,
        json: async () => ({
          success: true,
          balance: 90,
          transaction: {
            id: 'tx1',
            amount: -10,
            type: 'spend',
            action: body.action
          }
        })
      } as Response;
    }

    useConnectCoinStore.setState({ balance: 100, totalSpent: 0 })
    
    let success = await useConnectCoinStore.getState().spendCredits('user1', 'super_request')
    assert.strictEqual(success, true, "spendCredits should return true")
    assert.strictEqual(useConnectCoinStore.getState().balance, 90, "balance should be 90")
    assert.strictEqual(useConnectCoinStore.getState().totalSpent, 10, "totalSpent should be 10")
    
    console.log("✅ TEST 1 PASSED: Spend credits successfully")
    
    // TEST 2: Spend credits failure
    global.fetch = async (url, options) => {
      return {
        ok: true,
        json: async () => ({
          error: 'insufficient_funds'
        })
      } as Response;
    }
    
    useConnectCoinStore.setState({ balance: 100, totalSpent: 0 })
    success = await useConnectCoinStore.getState().spendCredits('user1', 'super_request')
    assert.strictEqual(success, false, "spendCredits should return false on error")
    assert.strictEqual(useConnectCoinStore.getState().balance, 100, "balance should remain 100")
    
    console.log("✅ TEST 2 PASSED: Spend credits failure")
    
    // TEST 3: trySpendAction shows confirmation when enough CC
    useConnectCoinStore.setState({ balance: 20 })
    let confirmed = false
    useConnectCoinStore.getState().trySpendAction('super_request', () => { confirmed = true })
    
    assert.ok(useConnectCoinStore.getState().showSpendConfirm, "Should show confirm dialog")
    assert.strictEqual(useConnectCoinStore.getState().showInsufficientBalance, null, "Should not show insufficient balance")
    
    // Execute confirm
    useConnectCoinStore.getState().showSpendConfirm!.onConfirm()
    assert.strictEqual(confirmed, true, "onConfirm callback should be executed")
    
    console.log("✅ TEST 3 PASSED: trySpendAction with enough CC")
    
    // TEST 4: trySpendAction shows insufficient balance when not enough CC
    useConnectCoinStore.setState({ balance: 5, showSpendConfirm: null, showInsufficientBalance: null })
    useConnectCoinStore.getState().trySpendAction('super_request', () => {})
    
    assert.ok(useConnectCoinStore.getState().showInsufficientBalance, "Should show insufficient balance dialog")
    assert.strictEqual(useConnectCoinStore.getState().showSpendConfirm, null, "Should not show confirm dialog")
    
    console.log("✅ TEST 4 PASSED: trySpendAction with insufficient CC")

    console.log("All tests passed successfully!")
    
  } catch (error) {
    console.error("Test failed:", error)
    process.exit(1)
  } finally {
    global.fetch = originalFetch;
  }
}

runTests();
