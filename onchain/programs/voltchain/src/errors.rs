use anchor_lang::prelude::*;

#[error_code]
pub enum VoltchainError {
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Sale not found")]
    SaleNotFound,
    #[msg("Sale already finalized")]
    SaleAlreadyFinalized,
    #[msg("Insufficient VoltChain balance")]
    InsufficientBalance,
    #[msg("User position not found")]
    UserPositionNotFound,
    #[msg("Invalid sale period")]
    InvalidSalePeriod,
    #[msg("Pool not initialized")]
    PoolNotInitialized,
}
