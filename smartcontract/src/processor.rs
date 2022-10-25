use crate::instructiontypes::InstructionTypes;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

pub struct Processor {}

impl Processor {
    pub fn parsing_instructions(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        
        InstructionTypes::unwrap_instructions(instruction_data);
        Ok(())
    }
}
