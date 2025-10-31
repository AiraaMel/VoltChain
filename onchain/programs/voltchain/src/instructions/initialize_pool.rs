use anchor_lang::prelude::*;
use crate::states::*;

#[derive(Accounts)]
#[instruction(authority: Pubkey, voltchain_mint: Pubkey)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = payer,
        space = Pool::LEN,
        seeds = [b"pool"],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializePool>,
    authority: Pubkey,
    voltchain_mint: Pubkey,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    pool.authority = authority;
    pool.voltchain_mint = voltchain_mint;
    pool.total_kwh = 0;
    pool.period = 0;
    pool.bump = ctx.bumps.pool;

    emit!(PoolInitialized {
        authority,
        voltchain_mint,
    });

    Ok(())
}

#[event]
pub struct PoolInitialized {
    pub authority: Pubkey,
    pub voltchain_mint: Pubkey,
}
