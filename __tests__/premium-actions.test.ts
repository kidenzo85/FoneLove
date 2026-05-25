import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConnectCoinStore, ACTION_COSTS } from '@/lib/connectcoin-store'

// Mock the global fetch
global.fetch = vi.fn()

describe('Premium Actions & CC Debits', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useConnectCoinStore.setState({
      balance: 100, // Initial user balance
      totalSpent: 0,
      transactions: [],
      actionConfigs: null,
    })
  })

  it('should successfully spend credits and update balance for an action', async () => {
    // Mock the API response for spending credits
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        balance: 90,
        transaction: {
          id: 'tx1',
          amount: -10, // Cost of action (e.g. super_request)
          type: 'spend',
          action: 'super_request'
        },
        activeFeature: {
          id: 'feat1',
          action: 'super_request',
          activatedAt: new Date().toISOString(),
          expiresAt: null
        }
      })
    })

    const userId = 'user_test_123'
    const action = 'super_request'
    
    // Validate initial state
    expect(useConnectCoinStore.getState().balance).toBe(100)

    // Call the action
    const success = await useConnectCoinStore.getState().spendCredits(userId, action)

    // Assert fetch was called with right payload
    expect(global.fetch).toHaveBeenCalledWith('/api/credits/spend', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ userId, action, metadata: undefined })
    }))

    // Assert success
    expect(success).toBe(true)

    // Assert local state is correctly updated (balance and totalSpent)
    const state = useConnectCoinStore.getState()
    expect(state.balance).toBe(90) // Debited 10 CC
    expect(state.totalSpent).toBe(10) // Cost of super_request
  })

  it('should fail and not deduct balance if API returns error', async () => {
    // Mock the API response to return an error (e.g. insufficient funds from server)
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        error: 'insufficient_funds'
      })
    })

    const userId = 'user_test_123'
    const action = 'super_request'
    
    // Validate initial state
    expect(useConnectCoinStore.getState().balance).toBe(100)

    // Call the action
    const success = await useConnectCoinStore.getState().spendCredits(userId, action)

    // Assert failure
    expect(success).toBe(false)

    // Assert local state is unchanged
    const state = useConnectCoinStore.getState()
    expect(state.balance).toBe(100) 
    expect(state.totalSpent).toBe(0) 
  })

  it('should show insufficient balance dialog if user has not enough CC', async () => {
    // Override local balance to 5 CC
    useConnectCoinStore.setState({ balance: 5 })
    
    const action = 'super_request' // costs 10 CC
    let onConfirmCalled = false
    const onConfirm = () => { onConfirmCalled = true }

    // trySpendAction
    useConnectCoinStore.getState().trySpendAction(action, onConfirm)

    const state = useConnectCoinStore.getState()
    
    // Should NOT show confirmation
    expect(state.showSpendConfirm).toBeNull()
    // SHOULD show insufficient balance dialog
    expect(state.showInsufficientBalance).not.toBeNull()
    expect(state.showInsufficientBalance?.action).toBe(action)
    expect(state.showInsufficientBalance?.cost).toBe(10)
    
    expect(onConfirmCalled).toBe(false)
  })

  it('should show confirm dialog if user has enough CC', async () => {
    // Override local balance to 20 CC
    useConnectCoinStore.setState({ balance: 20 })
    
    const action = 'super_request' // costs 10 CC
    let onConfirmCalled = false
    const onConfirm = () => { onConfirmCalled = true }

    // trySpendAction
    useConnectCoinStore.getState().trySpendAction(action, onConfirm)

    const state = useConnectCoinStore.getState()
    
    // SHOULD show confirmation dialog
    expect(state.showSpendConfirm).not.toBeNull()
    expect(state.showSpendConfirm?.action).toBe(action)
    expect(state.showSpendConfirm?.cost).toBe(10)
    // Should NOT show insufficient balance
    expect(state.showInsufficientBalance).toBeNull()
    
    // Execute confirm function attached
    state.showSpendConfirm?.onConfirm()
    expect(onConfirmCalled).toBe(true)
  })
})
