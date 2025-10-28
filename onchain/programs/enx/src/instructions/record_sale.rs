use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::EnxError;

#[derive(Accounts)]
#[instruction(kwh_sold_micro: u64, revenue_brl_cents: u64, fee_bps: u16)]
pub struct RecordSale<'info> {
    #[account(
        mut,
        seeds = [b"pool"],
        bump = pool.bump,
        constraint = pool.authority == authority.key() @ EnxError::InvalidAuthority
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        init,
        payer = authority,
        space = Sale::LEN,
        seeds = [b"sale", pool.period.to_le_bytes().as_ref()],
        bump
    )]
    pub sale: Account<'info, Sale>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RecordSale>,
    kwh_sold_micro: u64,
    revenue_brl_cents: u64,
    fee_bps: u16,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let sale = &mut ctx.accounts.sale;

    // Create sale for current period
    sale.id = pool.period;
    sale.kwh_sold = kwh_sold_micro;
    sale.revenue_brl_cents = revenue_brl_cents;
    sale.fee_bps = fee_bps;
    sale.finalized = false;
    sale.bump = ctx.bumps.sale;

    // Increment period for next sale
    pool.period = pool.period
        .checked_add(1)
        .ok_or(EnxError::InvalidAuthority)?;

    emit!(SaleRecorded {
        sale_id: sale.id,
        kwh_sold_micro,
        revenue_brl_cents,
        fee_bps,
    });

    Ok(())
}

#[event]
pub struct SaleRecorded {
    pub sale_id: u64,
    pub kwh_sold_micro: u64,
    pub revenue_brl_cents: u64,
    pub fee_bps: u16,
}
