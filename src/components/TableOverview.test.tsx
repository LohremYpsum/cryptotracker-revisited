import { screen, waitFor } from '@testing-library/react'
import axios, { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import { renderWithChakra } from '../test/renderWithChakra'
import TableOverview from './TableOverview'

function axiosErrorWithStatus(status: number): AxiosError {
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config: {},
  } as unknown as AxiosResponse)
}

describe('TableOverview', () => {
  it('renders the error as readable text instead of crashing', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(axiosErrorWithStatus(500))

    // Rendering an axios error object into JSX throws
    // "Objects are not valid as a React child" and takes the tree down with it.
    renderWithChakra(<TableOverview />)

    await waitFor(() => {
      expect(screen.getByText(/could not be loaded/i)).toBeInTheDocument()
    })
  })

  it('explains a rate limit in plain language', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(axiosErrorWithStatus(429))

    renderWithChakra(<TableOverview />)

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument()
    })
  })

  it('shows no error text when the request succeeds', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ data: [] })

    renderWithChakra(<TableOverview />)

    await waitFor(() => expect(screen.getByText('Currency Name')).toBeInTheDocument())
    expect(screen.queryByText(/could not be loaded/i)).not.toBeInTheDocument()
  })
})
