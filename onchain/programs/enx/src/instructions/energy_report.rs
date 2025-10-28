use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::EnxError;

#[derive(Accounts)]
pub struct EnergyReport<'info> {
    #[account(
        mut,
        seeds = [b"pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"user_position", owner.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.owner == owner.key() @ EnxError::InvalidAuthority
    )]
    pub user_position: Account<'info, UserPosition>,
    
    pub owner: Signer<'info>,
}

pub fn handler(
    ctx: Context<EnergyReport>,
    delta_kwh_micro: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let user_position = &mut ctx.accounts.user_position;

    user_position.accrued_kwh = user_position.accrued_kwh
        .checked_add(delta_kwh_micro)
        .ok_or(EnxError::InvalidAuthority)?;
    
    user_position.lifetime_kwh = user_position.lifetime_kwh
        .checked_add(delta_kwh_micro)
        .ok_or(EnxError::InvalidAuthority)?;

    pool.total_kwh = pool.total_kwh
        .checked_add(delta_kwh_micro)
        .ok_or(EnxError::InvalidAuthority)?;

    emit!(EnergyReported {
        owner: ctx.accounts.owner.key(),
        delta_kwh_micro,
        new_user_total: user_position.accrued_kwh,
        pool_total: pool.total_kwh,
    });

    Ok(())
}

#[event]
pub struct EnergyReported {
    pub owner: Pubkey,
    pub delta_kwh_micro: u64,
    pub new_user_total: u64,
    pub pool_total: u64,
}
