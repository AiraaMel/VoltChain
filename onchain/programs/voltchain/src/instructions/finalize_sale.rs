use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::VoltchainError;

#[derive(Accounts)]
#[instruction(sale_id: u64)]
pub struct FinalizeSale<'info> {
    #[account(
        seeds = [b"pool"],
        bump = pool.bump,
        constraint = pool.authority == authority.key() @ VoltchainError::InvalidAuthority
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"sale", sale_id.to_le_bytes().as_ref()],
        bump = sale.bump,
        constraint = !sale.finalized @ VoltchainError::SaleAlreadyFinalized
    )]
    pub sale: Account<'info, Sale>,
    
    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<FinalizeSale>,
    sale_id: u64,
) -> Result<()> {
    let sale = &mut ctx.accounts.sale;

    // Mark sale as finalized
    sale.finalized = true;

    emit!(SaleFinalized {
        sale_id,
        kwh_sold: sale.kwh_sold,
        revenue_brl_cents: sale.revenue_brl_cents,
        fee_bps: sale.fee_bps,
    });

    Ok(())
}

#[event]
pub struct SaleFinalized {
    pub sale_id: u64,
    pub kwh_sold: u64,
    pub revenue_brl_cents: u64,
    pub fee_bps: u16,
}
