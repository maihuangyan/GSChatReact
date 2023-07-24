import React from 'react'

const date = new Date();
const currentYear = date.getFullYear();

export default function CopyrightYear() {
  return (
    <>
      © GoldenSuisse {currentYear}. All rights reserved.
    </>
  )
}

