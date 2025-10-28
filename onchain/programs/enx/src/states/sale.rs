use anchor_lang::prelude::*;

#[account]
pub struct Sale {
    pub id: u64,
    pub kwh_sold: u64, // microkWh
    pub revenue_brl_cents: u64,
    pub fee_bps: u16, // basis points (e.g., 1500 = 15%)
    pub finalized: bool,
    pub bump: u8,
}

impl Sale {
    pub const LEN: usize = 8 + 8 + 8 + 8 + 2 + 1 + 1;
}
