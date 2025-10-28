use anchor_lang::prelude::*;
use crate::states::*;

#[derive(Accounts)]
pub struct RegisterUser<'info> {
    #[account(
        init,
        payer = owner,
        space = UserPosition::LEN,
        seeds = [b"user_position", owner.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RegisterUser>) -> Result<()> {
    let user_position = &mut ctx.accounts.user_position;
    user_position.owner = ctx.accounts.owner.key();
    user_position.accrued_kwh = 0;
    user_position.lifetime_kwh = 0;
    user_position.bump = ctx.bumps.user_position;

    emit!(UserRegistered {
        owner: ctx.accounts.owner.key(),
    });

    Ok(())
}

#[event]
pub struct UserRegistered {
    pub owner: Pubkey,
}
