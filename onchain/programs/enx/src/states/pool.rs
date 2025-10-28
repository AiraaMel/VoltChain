use anchor_lang::prelude::*;

#[account]
pub struct Pool {
    pub authority: Pubkey,
    pub enx_mint: Pubkey,
    pub total_kwh: u64, // microkWh
    pub period: u64,
    pub bump: u8,
}

impl Pool {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}
