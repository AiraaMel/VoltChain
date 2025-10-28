use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::VoltchainError;

#[derive(Accounts)]
#[instruction(sale_id: u64, kwh_to_burn_micro: u64)]
pub struct BurnAndMark<'info> {
    #[account(
        seeds = [b"pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [b"user_position", owner.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.owner == owner.key() @ VoltchainError::InvalidAuthority
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(
        init,
        payer = owner,
        space = UserClaim::LEN,
        seeds = [b"user_claim", owner.key().as_ref(), sale_id.to_le_bytes().as_ref()],
        bump
    )]
    pub user_claim: Account<'info, UserClaim>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<BurnAndMark>,
    sale_id: u64,
    kwh_to_burn_micro: u64,
) -> Result<()> {
    let user_position = &mut ctx.accounts.user_position;
    let user_claim = &mut ctx.accounts.user_claim;

    // Check if user has enough accrued kWh
    require!(
        user_position.accrued_kwh >= kwh_to_burn_micro,
        VoltchainError::InsufficientBalance
    );

    // Update user position (burn VoltChain)
    user_position.accrued_kwh = user_position.accrued_kwh
        .checked_sub(kwh_to_burn_micro)
        .ok_or(VoltchainError::InsufficientBalance)?;

    // Create user claim record
    user_claim.user = ctx.accounts.owner.key();
    user_claim.sale_id = sale_id;
    user_claim.claimable_brl_cents = 0; // Will be calculated off-chain
    user_claim.burned_voltchain = kwh_to_burn_micro;
    user_claim.claimed = false;
    user_claim.bump = ctx.bumps.user_claim;

    emit!(TokensBurned {
        owner: ctx.accounts.owner.key(),
        sale_id,
        kwh_burned_micro: kwh_to_burn_micro,
    });

    Ok(())
}

#[event]
pub struct TokensBurned {
    pub owner: Pubkey,
    pub sale_id: u64,
    pub kwh_burned_micro: u64,
}
