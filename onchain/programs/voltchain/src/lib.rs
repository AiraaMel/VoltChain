use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;

use instructions::*;

declare_id!("718k7JFp8Tf56eMTpTJMqmwNxME738nh48bXCiCm1BrR");

#[program]
pub mod voltchain {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        authority: Pubkey,
        voltchain_mint: Pubkey,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, authority, voltchain_mint)
    }

    pub fn register_user(ctx: Context<RegisterUser>) -> Result<()> {
        instructions::register_user::handler(ctx)
    }

    pub fn energy_report(
        ctx: Context<EnergyReport>,
        delta_kwh_micro: u64,
    ) -> Result<()> {
        instructions::energy_report::handler(ctx, delta_kwh_micro)
    }

    pub fn record_sale(
        ctx: Context<RecordSale>,
        kwh_sold_micro: u64,
        revenue_brl_cents: u64,
        fee_bps: u16,
    ) -> Result<()> {
        instructions::record_sale::handler(ctx, kwh_sold_micro, revenue_brl_cents, fee_bps)
    }

    pub fn burn_and_mark(
        ctx: Context<BurnAndMark>,
        sale_id: u64,
        kwh_to_burn_micro: u64,
    ) -> Result<()> {
        instructions::burn_and_mark::handler(ctx, sale_id, kwh_to_burn_micro)
    }

    pub fn finalize_sale(ctx: Context<FinalizeSale>, sale_id: u64) -> Result<()> {
        instructions::finalize_sale::handler(ctx, sale_id)
    }
}
