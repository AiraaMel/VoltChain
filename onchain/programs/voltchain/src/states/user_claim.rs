use anchor_lang::prelude::*;

#[account]
pub struct UserClaim {
    pub user: Pubkey,
    pub sale_id: u64,
    pub claimable_brl_cents: u64,
    pub burned_voltchain: u64, // microkWh
    pub claimed: bool,
    pub bump: u8,
}

impl UserClaim {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 1 + 1;
}
