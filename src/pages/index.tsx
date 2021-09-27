import { GetStaticProps } from 'next';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const handleClickButton = async (): Promise<void> => {
    fetch(`${nextPage}`)
      .then(response => response.json())
      .then(result => {
        setPosts([
          ...posts,
          {
            uid: result.results[0].uid,
            first_publication_date: result.results[0].first_publication_date,
            data: {
              title: result.results[0].data.title,
              subtitle: result.results[0].data.subtitle,
              author: result.results[0].data.author,
            },
          },
        ]);

        setNextPage(result.next_page);
      });
  };

  return (
    <div className={commonStyles.container}>
      <Header />
      <main className={styles.content}>
        {posts.map(post => (
          <article key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
              </a>
            </Link>
            <h2>{post.data.subtitle}</h2>
            <div className={commonStyles.infoWrapper}>
              <div>
                <FiCalendar />
                <time>
                  {format(new Date(post.first_publication_date), 'dd LLL y', {
                    locale: ptBR,
                  })}
                </time>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
            </div>
          </article>
        ))}

        {nextPage !== null && (
          <button type="button" onClick={handleClickButton}>
            Carregar mais posts
          </button>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const results: Post[] = postsResponse.results?.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
