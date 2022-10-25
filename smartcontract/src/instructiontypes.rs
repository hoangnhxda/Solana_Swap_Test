use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub enum InstructionTypes {
    CreateTokenccount,
    SwapSolToMove {amount: u64},
    SwapMoveToSol {amount: u64},
}

impl InstructionTypes {
    pub fn unwrap_instructions(data: &[u8]) -> Result<Self, ProgramError> {
        if let Some((first, elements)) = data.split_first() {
            match first {
                0 => {
                    msg!("Command: CreateTokenccount");
                    return Ok(Self::CreateTokenccount);
                }
                1 => {
                    let data_amount = Self::merge_u8_arr_to_uint64(elements).unwrap();
                    msg!("Command: SwapSolToMove ");
                    return Ok(Self::SwapSolToMove {
                        amount: data_amount
                    });
                }
                2 => {
                    let data_amount = Self::merge_u8_arr_to_uint64(elements).unwrap();
                    msg!("Command: SwapSolToMove ");
                    return Ok(Self::SwapMoveToSol {
                        amount: data_amount
                    });
                }
                _ => {
                    return Ok(Self::CreateTokenccount);
                }
            }
        } else {
            return Ok(Self::CreateTokenccount);
        }
    }

    pub fn merge_u8_arr_to_uint64(data: &[u8]) -> Result<u64, ProgramError> {
        return data.get(..8)
                .and_then(|slice| slice.try_into().ok())
                .map(u64::from_le_bytes)
                .ok_or(solana_program::program_error::ProgramError::Custom(0));
    }
}