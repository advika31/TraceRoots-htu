use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod traceroots {
    use super::*;

    pub fn create_batch(
        ctx: Context<CreateBatch>,
        batch_id: String,
        crop_type: String,
        origin_hash: [u8; 32],
        expiry_date: i64,
    ) -> Result<()> {
        require!(batch_id.len() <= 64, TracerootsError::BatchIdTooLong);
        require!(crop_type.len() <= 64, TracerootsError::CropTypeTooLong);
        require!(
            expiry_date > Clock::get()?.unix_timestamp,
            TracerootsError::InvalidExpiry
        );

        let batch = &mut ctx.accounts.batch;

        batch.batch_id = batch_id;
        batch.crop_type = crop_type;
        batch.origin_hash = origin_hash;
        batch.expiry_date = expiry_date;
        batch.timestamp = Clock::get()?.unix_timestamp;
        batch.authority = ctx.accounts.user.key();

        emit!(BatchCreated {
            batch_id: batch.batch_id.clone(),
            crop_type: batch.crop_type.clone(),
            origin_hash: batch.origin_hash,
            expiry_date: batch.expiry_date,
            timestamp: batch.timestamp,
        });

        Ok(())
    }

    pub fn get_batch(_ctx: Context<GetBatch>) -> Result<()> {
        // Read-only: batch account is passed in and can be read by client
        // This exists for IDL/interface parity with Ethereum; actual fetch is done client-side
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct CreateBatch<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + BatchData::INIT_SPACE,
        seeds = [b"batch", batch_id.as_bytes()],
        bump
    )]
    pub batch: Account<'info, BatchData>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct GetBatch<'info> {
    #[account(
        seeds = [b"batch", batch_id.as_bytes()],
        bump
    )]
    pub batch: Account<'info, BatchData>,
}

#[account]
#[derive(InitSpace)]
pub struct BatchData {
    #[max_len(64)]
    pub batch_id: String,

    #[max_len(64)]
    pub crop_type: String,

    pub origin_hash: [u8; 32],
    pub expiry_date: i64,
    pub timestamp: i64,
    pub authority: Pubkey,
}

#[event]
pub struct BatchCreated {
    pub batch_id: String,
    pub crop_type: String,
    pub origin_hash: [u8; 32],
    pub expiry_date: i64,
    pub timestamp: i64,
}

#[error_code]
pub enum TracerootsError {
    #[msg("Batch ID must be 64 characters or less")]
    BatchIdTooLong,

    #[msg("Crop type must be 64 characters or less")]
    CropTypeTooLong,

    #[msg("Expiry date must be in the future")]
    InvalidExpiry,
}
