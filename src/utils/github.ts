export type Repo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  forks_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: 'https://tx.shadcn.com';
  size: number;
  stargazers_count: number;
  watchers_count: number;
};

export type ContributionDay = {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
};

export type ContibutionWeek = {
  contributionDays: ContributionDay[];
  firstDay: string;
};

export class Github {
  #auth_token: string;
  #base_url: string;
  #username: string;
  #headers: HeadersInit;

  constructor() {
    this.#auth_token = import.meta.env.GITHUB_TOKEN;
    this.#base_url = 'https://api.github.com';
    this.#username = 'suleymanbariseser';

    this.#headers = {
      Authorization: `token ${this.#auth_token}`,
    };
  }

  getRepos = async (): Promise<Repo[]> => {
    const repos = (await fetch(
      `${this.#base_url}/users/${this.#username}/repos`,
      {
        headers: this.#headers,
      }
    ).then((res) => res.json())) as Repo[];

    return repos
      .filter((rep) => !rep.fork)
      .sort((a, b) => {
        return new Date(a.created_at).getTime() >
          new Date(b.created_at).getTime()
          ? -1
          : 1;
      })
      .slice(0, 3);
  };

  getAllContributions = async () => {
    const body = {
      query: `query {
          user(login: "${this.#username}") {
            name
            contributionsCollection {
              contributionCalendar {
                colors
                totalContributions
                weeks {
                  contributionDays {
                    color
                    contributionCount
                    date
                    weekday
                  }
                  firstDay
                }
              }
            }
          }
        }`,
    };
    const result = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: this.#headers,
    }).then((res) => res.json());

    return result.data.user.contributionsCollection.contributionCalendar
      .weeks as ContibutionWeek[];
  };
}
