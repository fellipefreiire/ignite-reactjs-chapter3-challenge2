import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';
import { NavigationSection } from '../../components/NavigationSection';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
  navigationItems?: {
    nextPost?: {
      uid: string;
      data: {
        title: string;
      };
    };
    previousPost?: {
      uid: string;
      data: {
        title: string;
      };
    };
  };
}

export default function Post({
  post,
  navigationItems,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const formattedContent = post.data.content.map(item => {
    return {
      heading: item.heading,
      body: RichText.asHtml(item.body),
    };
  });

  const words = post.data.content.reduce((acc, item) => {
    const headingWords = item.heading.split(/\s+/).length;
    const bodyWords = RichText.asText(item.body).split(/\s+/).length;
    const sum = headingWords + bodyWords;
    // eslint-disable-next-line no-param-reassign
    acc += sum;

    return acc;
  }, 0);

  const wpm = 200;

  const timeToRead = `${Math.ceil(words / wpm)} min`;

  const lastEditedArray = post.last_publication_date.split(' ');
  const lastEditedDate = `${lastEditedArray[0]} ${lastEditedArray[1]} ${lastEditedArray[2]}`;
  const lastEditedTime = `${lastEditedArray[3]}`;

  return (
    <div className={styles.container}>
      <Header />
      <img src={post.data.banner.url} alt="" />
      <div className={styles.content}>
        <h1>{post.data.title}</h1>
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
          <div>
            <FiClock />
            <span>{timeToRead}</span>
          </div>
        </div>
        <span className={styles.lastEdited}>
          *editado em {lastEditedDate}, às {lastEditedTime}
        </span>

        <div className={styles.bodyContent}>
          {formattedContent.map(item => {
            return (
              <div key={item.heading}>
                <h2>{item.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: item.body }} />
              </div>
            );
          })}
        </div>

        <NavigationSection
          nextPost={navigationItems?.nextPost}
          previousPost={navigationItems?.previousPost}
        />

        <Comments />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    { orderings: '[my.post.date desc]' }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
      },
    };
  });

  const currentPostPositionIndex = results.findIndex(
    post => post.uid === response.uid
  );

  const otherPosts = results.filter(
    (post, index) =>
      index === currentPostPositionIndex + 1 ||
      index === currentPostPositionIndex - 1
  );

  const navigationItems = {
    nextPost: otherPosts[1] ?? null,
    previousPost: otherPosts[0] ?? null,
  };

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: format(
      new Date(response.last_publication_date),
      'dd LLL y HH:MM',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
      navigationItems,
    },
  };
};
