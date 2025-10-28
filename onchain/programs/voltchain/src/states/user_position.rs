use anchor_lang::prelude::*;

#[account]
pub struct UserPosition {
    pub owner: Pubkey,
    pub accrued_kwh: u64, // microkWh in current period
    pub lifetime_kwh: u64, // total microkWh ever generated
    pub bump: u8,
}

impl UserPosition {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 1;
}
